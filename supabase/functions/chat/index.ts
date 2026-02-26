/**
 * Supabase Edge Function: /functions/v1/chat
 *
 * Orchestrates the full AI chat pipeline:
 *   1. Authenticate user via Supabase JWT
 *   2. Validate and sanitize message input
 *   3. Load user's GitHub + Jira integration credentials from Supabase
 *   4. Load team members from Supabase
 *   5. Detect intent from conversation
 *   6. Fetch GitHub + Jira context in parallel (deep crawl)
 *   7. Build Gemini request with system prompt + context + history
 *   8. Stream Gemini SSE response → translate to OpenAI-compatible SSE → browser
 *
 * The browser client in src/services/chat.ts already parses the OpenAI-compatible
 * SSE format (choices[0].delta.content / data: [DONE]) — no frontend changes needed.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { requireAuth, validateMessages, jsonResponse } from './_security.ts';
import { SYSTEM_PROMPT, buildGeminiContents } from './_types.ts';
import { getUserIntegrations, getTeamMembers, formatTeamContext } from './_integrations.ts';
import { detectIntent, fetchContext } from './_context.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const GEMINI_MODEL   = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
  }

  // ── Step 0: Authenticate ─────────────────────────────────────────────────
  let jwt: string;
  try {
    const auth = await requireAuth(req);
    jwt = auth.jwt;
  } catch (errResp) {
    if (errResp instanceof Response) {
      return addCors(errResp);
    }
    return addCors(jsonResponse({ error: 'Authentication error' }, 500));
  }

  // ── Step 1: Parse + validate input ───────────────────────────────────────
  let messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  try {
    const body = await req.json();
    messages = validateMessages(body?.messages);
  } catch (errResp) {
    if (errResp instanceof Response) return addCors(errResp);
    return addCors(jsonResponse({ error: 'Invalid JSON body' }, 400));
  }

  // ── Step 2: Load per-user data from Supabase (parallel) ──────────────────
  const [integrations, teamMembers] = await Promise.all([
    getUserIntegrations(jwt).catch(err => {
      console.error('Failed to load integrations:', err);
      return {};
    }),
    getTeamMembers(jwt).catch(err => {
      console.error('Failed to load team members:', err);
      return [];
    }),
  ]);

  // ── Step 3: Detect intent ─────────────────────────────────────────────────
  const intent = detectIntent(messages);

  // ── Step 4: Fetch live context (GitHub + Jira) in parallel ───────────────
  const [liveContext, teamContext] = await Promise.all([
    fetchContext(intent, integrations).catch(err => {
      console.error('Context fetch error:', err);
      return '';
    }),
    Promise.resolve(formatTeamContext(teamMembers)),
  ]);

  const contextBlock = [teamContext, liveContext].filter(Boolean).join('\n\n');

  // Append integration status note if no credentials configured
  const hasGitHub = !!integrations.github;
  const hasJira   = !!integrations.jira;
  const integrationNote = (!hasGitHub || !hasJira)
    ? `\n<integration_status>\n${!hasGitHub ? '  GitHub: not connected (no live repo data available)\n' : ''}${!hasJira ? '  Jira: not connected (no live ticket data available)\n' : ''}  Tip: Connect integrations in the Integrations page for live data.\n</integration_status>`
    : '';

  const fullContext = contextBlock + integrationNote;

  // ── Step 5: Validate Gemini is configured ────────────────────────────────
  if (!GEMINI_API_KEY) {
    return addCors(jsonResponse({ error: 'AI service not configured. Set GEMINI_API_KEY.' }, 503));
  }

  // ── Step 6: Build Gemini request body ────────────────────────────────────
  const geminiBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: buildGeminiContents(messages, fullContext),
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      // Keep safety settings moderate — PM content shouldn't need loosening
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  // ── Step 7: Call Gemini streaming endpoint ────────────────────────────────
  let geminiResp: Response;
  try {
    geminiResp = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });
  } catch (err) {
    console.error('Gemini unreachable:', err);
    return addCors(jsonResponse({ error: 'AI service unreachable' }, 502));
  }

  if (!geminiResp.ok) {
    const errText = await geminiResp.text().catch(() => '');
    console.error(`Gemini error ${geminiResp.status}:`, errText);

    if (geminiResp.status === 429) {
      return addCors(jsonResponse({ error: 'Rate limit exceeded. Please try again in a moment.' }, 429));
    }
    return addCors(jsonResponse({ error: `AI API error (${geminiResp.status})` }, 502));
  }

  // ── Step 8: Translate Gemini SSE → OpenAI-compatible SSE → browser ───────
  //
  // Gemini format:  data: {"candidates":[{"content":{"parts":[{"text":"token"}]}}]}
  // Browser expects: data: {"choices":[{"delta":{"content":"token"},"index":0}]}
  //
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer  = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const reader  = geminiResp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';   // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const jsonStr = trimmed.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);

            // Check for safety blocks or unexpected finish
            const finishReason = parsed?.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
              console.warn('Gemini finish reason:', finishReason);
              if (finishReason === 'SAFETY') {
                await writer.write(encoder.encode(
                  `data: ${JSON.stringify({ choices: [{ delta: { content: '\n\n*Content filtered by safety settings.*' } }] })}\n\n`,
                ));
              }
              continue;
            }

            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
            if (text) {
              const chunk = {
                choices: [{ delta: { content: text }, index: 0, finish_reason: null }],
              };
              await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
          } catch {
            // Partial JSON — skip (will be retried with next chunk)
          }
        }
      }
    } catch (err) {
      console.error('Stream read error:', err);
    } finally {
      // Always send DONE so the client knows the stream is complete
      await writer.write(encoder.encode('data: [DONE]\n\n')).catch(() => {});
      await writer.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'X-Accel-Buffering': 'no',  // disable nginx buffering
      'Connection': 'keep-alive',
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function addCors(resp: Response): Response {
  const headers = new Headers(resp.headers);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  return new Response(resp.body, { status: resp.status, headers });
}
