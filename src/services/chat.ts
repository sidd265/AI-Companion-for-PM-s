/**
 * Chat / AI assistant service layer.
 *
 * - Conversations and messages are persisted to Supabase.
 * - streamChat sends the user's session JWT (not the anon key) so the
 *   edge function can authenticate the user and load their integrations.
 * - Falls back to a rich mock response when the edge function URL is
 *   not configured (local dev without a backend).
 */

import { supabase } from '@/lib/supabase';
import { conversations as mockConversations, type Conversation, type Message } from '@/data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Conversation CRUD — backed by Supabase
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchConversations(): Promise<Conversation[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return mockConversations;

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      messages ( id, role, content, attachments, created_at )
    `)
    .order('updated_at', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return mockConversations;

  return data.map(conv => {
    const sorted = [...((conv.messages as any[]) ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const lastMsg = sorted.at(-1);
    return {
      id: conv.id,
      title: conv.title,
      preview: lastMsg?.content?.slice(0, 60) ?? '',
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      messages: sorted.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.created_at,
        attachments: m.attachments ?? undefined,
      })),
    };
  });
}

export async function createConversation(): Promise<Conversation> {
  const { data: { session } } = await supabase.auth.getSession();

  // Unauthenticated fallback
  if (!session) {
    return {
      id: Date.now().toString(),
      title: 'New conversation',
      preview: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: session.user.id, title: 'New conversation' })
    .select()
    .single();

  if (error || !data) {
    // Fallback with a local-only id that won't persist
    return {
      id: Date.now().toString(),
      title: 'New conversation',
      preview: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }

  return {
    id: data.id,
    title: data.title,
    preview: '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    messages: [],
  };
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  const { error } = await supabase.from('conversations').delete().eq('id', id);
  return { success: !error };
}

/** Persists a message to Supabase. Fire-and-forget — does not block the UI. */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
    .select('id')
    .single();
  return error ? null : (data?.id ?? null);
}

/** Updates the conversation title and bumps updated_at. */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<void> {
  await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}

// Legacy stubs kept for compatibility
export async function sendMessage(
  _conversationId: string,
  content: string,
  attachments?: { name: string; type: string; size: number; url: string }[],
): Promise<Message> {
  return {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
    attachments,
  };
}

/** @deprecated Use streamChat instead */
export async function generateAIResponse(_conversationId: string, query: string): Promise<string> {
  return getMockAnswer(query);
}

// ─────────────────────────────────────────────────────────────────────────────
// Streaming AI chat
// ─────────────────────────────────────────────────────────────────────────────

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
  : null;

/**
 * Stream an AI response from the Supabase edge function.
 *
 * Sends the user's live session JWT — NOT the anon key — so the edge
 * function can identify the user and load their GitHub/Jira credentials.
 *
 * Falls back to a rich local mock when no backend URL is configured.
 */
export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}) {
  if (!CHAT_URL) {
    await streamMockResponse(messages, onDelta, onDone);
    return;
  }

  // ── Get the user's session JWT ──────────────────────────────────────────
  const { data: { session } } = await supabase.auth.getSession();
  const jwt = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });

    if (resp.status === 429) {
      onError?.(new Error('Rate limit exceeded. Please try again in a moment.'));
      onDone();
      return;
    }
    if (resp.status === 401) {
      onError?.(new Error('Session expired. Please sign in again.'));
      onDone();
      return;
    }
    if (!resp.ok || !resp.body) {
      throw new Error(`AI request failed (${resp.status})`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ') || line.trim() === '') continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    // Flush remaining buffer
    for (const raw of buffer.split('\n')) {
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }

    onDone();
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Unknown streaming error');
    console.error('streamChat error:', error);
    onError?.(error);
    onDone();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local mock fallback (when edge function isn't deployed yet)
// ─────────────────────────────────────────────────────────────────────────────

async function streamMockResponse(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  onDone: () => void,
) {
  const lastUser = messages.filter(m => m.role === 'user').pop()?.content ?? '';
  const response = getMockAnswer(lastUser);
  const words = response.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, 25 + Math.random() * 35));
    onDelta((i === 0 ? '' : ' ') + words[i]);
  }
  onDone();
}

function getMockAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('repo') || q.includes('repositor'))
    return '## Repository Overview\n\nYour organization has **5 active repos**:\n\n- **payment-service** (TypeScript) — Stripe payments, 3 open PRs\n- **user-auth** (Python) — JWT auth microservice, 2 open PRs\n- **web-frontend** (TypeScript) — React 18 app, 5 open PRs\n- **api-gateway** (Go) — Central gateway, 1 open PR\n- **notification-service** (Node.js) — Email/SMS/push, stable\n\nWould you like details on any specific repo?';

  if (q.includes('payment') || q.includes('refund'))
    return 'The payment refund flow in **payment-service** works in three steps:\n\n1. **Validation** — checks transaction eligibility and amount\n2. **Stripe API** — calls `/v1/refunds` with idempotency key\n3. **DB Update** — marks transaction as refunded in PostgreSQL\n\nPR #142 from @sarachen is currently in review and nearly ready to merge.';

  if (q.includes('sprint') || q.includes('status'))
    return '## Sprint 14 Status\n\n**40% complete** (6/15 tickets)\n\n| Status | Count |\n|---|---|\n| ✅ Done | 6 |\n| 🔵 In Progress | 5 |\n| 🟡 In Review | 2 |\n| ⚪ To Do | 1 |\n| 🔴 Blocked | **1** |\n\n**Blocker:** BACK-1237 (DB optimization) waiting for DBA sign-off.\n**At risk:** AUTH-1235 (Critical) needs @sarachen approval on PR #89 today.';

  if (q.includes('assign') || q.includes('who should'))
    return 'Based on expertise and capacity:\n\n**Top recommendation:** Michael Torres (Frontend Lead)\n- TypeScript, React, CSS, Tailwind ✓\n- 60% current load — room available\n\n**Alternative:** Emily Rodriguez (Full Stack)\n- React/JS capable, but at 85% capacity — risk of overload\n\nWould you like me to check a specific ticket?';

  if (q.includes('block'))
    return '## Blocked Tickets\n\n**BACK-1237** — Database optimization for search queries\n- Assigned to @jamespark\n- **Blocked:** Waiting for DBA review before adding GIN indexes on prod\n- Impact: 3–5 second search latency affecting all users\n- **Recommended action:** Escalate DBA review or ship Redis cache as interim fix';

  return 'I can help you with:\n\n- **Repo analysis** — code, PRs, commits, and issues\n- **Sprint tracking** — status, velocity, and blockers\n- **Ticket search** — find and understand any ticket\n- **Team assignments** — expertise and capacity-based recommendations\n- **Cross-references** — link PRs to tickets\n\nWhat would you like to know?';
}
