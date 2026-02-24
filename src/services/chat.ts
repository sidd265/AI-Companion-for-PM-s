/**
 * Chat / AI assistant data service layer.
 *
 * Conversation CRUD uses Supabase. Streaming chat keeps mock AI fallback.
 */

import { supabase } from '@/lib/supabase';
import type { Conversation, Message } from '@/data/mockData';

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

interface ConversationRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  attachments: unknown;
  created_at: string;
}

function rowToConversation(row: ConversationRow, messages: Message[]): Conversation {
  return {
    id: row.id,
    title: row.title,
    preview: messages[0]?.content.slice(0, 80) ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages,
  };
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    timestamp: row.created_at,
    attachments: row.attachments as Message['attachments'],
  };
}

// ---------------------------------------------------------------------------
// Conversation CRUD
// ---------------------------------------------------------------------------

export async function fetchConversations(): Promise<Conversation[]> {
  const { data: convRows, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || !convRows) return [];

  const convs = convRows as ConversationRow[];
  const results: Conversation[] = [];
  for (const conv of convs) {
    const { data: msgRows } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    const messages = msgRows ? (msgRows as MessageRow[]).map(rowToMessage) : [];
    results.push(rowToConversation(conv, messages));
  }

  return results;
}

export async function createConversation(): Promise<Conversation> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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
    .insert({ user_id: user.id, title: 'New conversation' })
    .select()
    .single();

  if (error || !data) {
    return {
      id: Date.now().toString(),
      title: 'New conversation',
      preview: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }

  return rowToConversation(data as ConversationRow, []);
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  const { error } = await supabase.from('conversations').delete().eq('id', id);
  return { success: !error };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: { name: string; type: string; size: number; url: string }[],
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content,
      attachments: attachments ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachments,
    };
  }

  return rowToMessage(data as MessageRow);
}

// ---------------------------------------------------------------------------
// Streaming AI chat (kept as-is — mock fallback + edge function support)
// ---------------------------------------------------------------------------

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
  : null;

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

  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          ? { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` }
          : {}),
      },
      body: JSON.stringify({ messages }),
    });

    if (resp.status === 429) {
      onError?.(new Error('Rate limit exceeded. Please try again in a moment.'));
      onDone();
      return;
    }
    if (resp.status === 402) {
      onError?.(new Error('AI usage limit reached. Please add credits to continue.'));
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

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

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

    if (buffer.trim()) {
      for (let raw of buffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Unknown streaming error');
    console.error('streamChat error:', error);
    onError?.(error);
    onDone();
  }
}

// ---------------------------------------------------------------------------
// Mock streaming fallback
// ---------------------------------------------------------------------------

async function streamMockResponse(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  onDone: () => void,
) {
  const lastUser = messages.filter(m => m.role === 'user').pop()?.content ?? '';
  const response = getMockAnswer(lastUser);
  const words = response.split(' ');

  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
    onDelta((i === 0 ? '' : ' ') + words[i]);
  }
  onDone();
}

function getMockAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('payment') || q.includes('refund'))
    return 'The payment refund flow works in three main steps:\n\n1. **Request Validation** — the system validates the original transaction and checks refund eligibility.\n2. **Stripe Integration** — the service calls Stripe\'s Refund API.\n3. **Database Update** — the transaction status is updated after processing.\n\nWould you like me to show who worked on this feature recently?';
  if (q.includes('assign') || q.includes('who should'))
    return 'Based on expertise and current workload, I recommend:\n\n1. **Sarah Chen** — 85% expertise match, 60% capacity, 15 commits to similar services.\n2. **James Park** — 75% expertise match, 70% capacity.\n\nWould you like me to create a ticket and assign it?';
  if (q.includes('sprint') || q.includes('status') || q.includes('progress'))
    return '**Sprint Progress Summary**\n\nOverall: 56% complete (18/32 tickets)\n\n- **Done:** 18 tickets\n- **In Progress:** 6 tickets\n- **To Do:** 6 tickets\n- **Blocked:** 2 tickets\n\nWould you like me to show the blocked tickets?';
  return `I can help you with:\n\n- **Repository analysis** — code structure and recent changes\n- **Task assignment** — optimal team member suggestions\n- **Sprint tracking** — progress and blockers\n- **Team insights** — capacity and expertise\n\nCould you provide more details about what you'd like to know?`;
}

/** @deprecated Use streamChat instead */
export async function generateAIResponse(_conversationId: string, query: string): Promise<string> {
  return getMockAnswer(query);
}
