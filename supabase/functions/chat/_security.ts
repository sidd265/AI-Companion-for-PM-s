/**
 * Security layer: authentication, input validation, and sanitization.
 * All requests pass through this module before any AI or API work begins.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

// Hard limits — prevent context-window abuse and resource exhaustion
const MAX_MESSAGES       = 40;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_TOTAL_CHARS    = 60_000;
const ALLOWED_ROLES      = new Set(['user', 'assistant']);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the request carries a valid Supabase JWT.
 * Returns the authenticated user's ID and the raw JWT on success.
 * Throws a Response with appropriate status code on failure.
 */
export async function requireAuth(req: Request): Promise<{ userId: string; jwt: string }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw jsonResponse({ error: 'Missing authorization token' }, 401);
  }

  const jwt = authHeader.slice(7).trim();
  if (!jwt) throw jsonResponse({ error: 'Empty authorization token' }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw jsonResponse({ error: 'Invalid or expired token' }, 401);
  }

  return { userId: user.id, jwt };
}

// ─────────────────────────────────────────────────────────────────────────────
// Input validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates and returns a sanitized message array.
 * Throws a 400 Response on any violation.
 */
export function validateMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw jsonResponse({ error: 'messages must be a non-empty array' }, 400);
  }
  if (raw.length > MAX_MESSAGES) {
    throw jsonResponse({ error: `Too many messages (max ${MAX_MESSAGES})` }, 400);
  }

  let totalChars = 0;
  const messages: ChatMessage[] = raw.map((item, i) => {
    if (typeof item !== 'object' || item === null) {
      throw jsonResponse({ error: `Message at index ${i} is not an object` }, 400);
    }
    const { role, content } = item as Record<string, unknown>;

    if (typeof role !== 'string' || !ALLOWED_ROLES.has(role)) {
      throw jsonResponse({ error: `Invalid role at index ${i}. Must be 'user' or 'assistant'` }, 400);
    }
    if (typeof content !== 'string') {
      throw jsonResponse({ error: `content at index ${i} must be a string` }, 400);
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw jsonResponse({ error: `Message at index ${i} exceeds ${MAX_MESSAGE_LENGTH} characters` }, 400);
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      throw jsonResponse({ error: 'Total conversation length exceeds size limit' }, 400);
    }

    return {
      role: role as 'user' | 'assistant',
      content: stripControlChars(content),
    };
  });

  // Last message must be from user so Gemini can respond
  if (messages[messages.length - 1].role !== 'user') {
    throw jsonResponse({ error: 'Last message must be from the user' }, 400);
  }

  return messages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanitization helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Removes null bytes and control characters (preserves \t and \n).
 */
export function stripControlChars(s: string): string {
  return s.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitizes text coming from external APIs (GitHub body, Jira description)
 * before embedding in a Gemini prompt.
 * Strips HTML tags, decodes common entities, collapses whitespace, truncates.
 */
export function sanitizeExternalText(text: unknown, maxLength: number): string {
  if (typeof text !== 'string' || !text) return '';
  return stripControlChars(
    text
      .replace(/<[^>]*>/g, ' ')           // strip HTML tags
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&[a-z]+;/gi, ' ')         // remaining HTML entities → space
      .replace(/\s+/g, ' ')               // collapse whitespace
      .trim(),
  ).slice(0, maxLength);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
