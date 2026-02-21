/**
 * Chat / AI assistant data service layer.
 *
 * Currently returns mock data and client-side AI responses.
 * TODO: Replace with backend API calls (LLM integration) when Cloud is enabled.
 */

import { conversations as initialConversations, type Conversation, type Message } from '@/data/mockData';

/**
 * Fetch all conversations.
 * TODO: Replace with edge function call → conversations API
 */
export async function fetchConversations(): Promise<Conversation[]> {
  return initialConversations;
}

/**
 * Create a new conversation.
 * TODO: Replace with edge function call → conversations API POST
 */
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

/**
 * Delete a conversation by ID.
 * TODO: Replace with edge function call → conversations API DELETE
 */
export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  console.log('deleteConversation called with:', id);
  return { success: true };
}

/**
 * Send a user message to a conversation.
 * TODO: Replace with edge function call → messages API POST
 */
export async function sendMessage(
  conversationId: string,
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

/**
 * Generate an AI response for a conversation.
 * TODO: Replace with edge function call → LLM API (OpenAI, etc.)
 */
export async function generateAIResponse(
  _conversationId: string,
  query: string,
): Promise<string> {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('payment') || lowerQuery.includes('refund')) {
    return `The payment refund flow works in three main steps:

1. **Request Validation:** When a refund is requested, the system first validates the original transaction and checks if it's eligible for refund.

2. **Stripe Integration:** The service communicates with Stripe's Refund API to process the actual refund.

3. **Database Update:** After successful processing, the transaction status is updated in our database.

Would you like me to show you who has worked on this feature recently?`;
  }

  if (lowerQuery.includes('assign') || lowerQuery.includes('who should')) {
    return `Based on expertise and current workload, I recommend:

1. **Top Recommendation: Sarah Chen**
   - 85% expertise match (Python, AWS, Backend)
   - 60% current capacity (has bandwidth)
   - 15 commits to similar services

2. **Alternative: James Park**
   - 75% expertise match
   - 70% capacity (moderately busy)

Would you like me to create a Jira ticket and assign it automatically?`;
  }

  if (lowerQuery.includes('sprint') || lowerQuery.includes('status') || lowerQuery.includes('progress')) {
    return `**Sprint Progress Summary**

Overall: 56% complete (18/32 tickets)

- **Done:** 18 tickets
- **In Progress:** 6 tickets
- **To Do:** 6 tickets
- **Blocked:** 2 tickets

**Risks:**
- 2 tickets are blocked and need attention
- 7 tickets are unassigned

Would you like me to show the blocked tickets?`;
  }

  return `I understand you're asking about "${query}".

I can help you with:

1. **Repository analysis** - Explain code structure and recent changes
2. **Task assignment** - Suggest optimal team member assignments
3. **Sprint tracking** - Review progress and identify blockers
4. **Team insights** - Analyze capacity and expertise

Could you provide more specific details about what you'd like to know?`;
}
