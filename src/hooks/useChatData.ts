/**
 * React Query hooks for chat data.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '@/services/chat';

const STALE_TIME = 5 * 60 * 1000;

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: fetchConversations,
    staleTime: STALE_TIME,
  });
}
