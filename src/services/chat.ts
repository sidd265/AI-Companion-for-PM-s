/**
 * Chat / AI assistant data service layer.
 *
 * Streaming chat is configured to call a backend edge function at
 * VITE_SUPABASE_URL/functions/v1/chat. Until the backend is deployed,
 * a mock fallback streams a canned response client-side.
 */

import { conversations as initialConversations, type Conversation, type Message } from '@/data/mockData';

// ---------------------------------------------------------------------------
// Conversation CRUD (unchanged mock stubs)
// ---------------------------------------------------------------------------

export async function fetchConversations(): Promise<Conversation[]> {
  return initialConversations;
}

export async function createConversation(): Promise<Conversation> {
  return {
    id: Date.now().toString(),
    title: 'New conversation',
    preview: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  void id;
  return { success: true };
}

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

// ---------------------------------------------------------------------------
// Streaming AI chat
// ---------------------------------------------------------------------------

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
  : null;

/**
 * Stream an AI response from the backend edge function.
 * Falls back to a mock response when no backend URL is configured.
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
  // ---- Mock fallback when backend isn't configured yet ----
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

    // Flush remaining buffer
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
// Mock streaming fallback (simulates token-by-token delivery)
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
