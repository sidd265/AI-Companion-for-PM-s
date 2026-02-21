import { useQuery } from '@tanstack/react-query';
import {
  fetchTicketTrends,
  fetchSprintBurndown,
  fetchPRActivity,
  type TicketTrendPoint,
  type SprintBurndownPoint,
  type SprintMeta,
  type PRActivityPoint,
} from '@/services/chartData';

export function useTicketTrends() {
  return useQuery<TicketTrendPoint[]>({
    queryKey: ['chart', 'ticket-trends'],
    queryFn: fetchTicketTrends,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useSprintBurndown() {
  return useQuery<{ data: SprintBurndownPoint[]; meta: SprintMeta }>({
    queryKey: ['chart', 'sprint-burndown'],
    queryFn: fetchSprintBurndown,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePRActivity(repo: string = 'all') {
  return useQuery<PRActivityPoint[]>({
    queryKey: ['chart', 'pr-activity', repo],
    queryFn: () => fetchPRActivity(repo),
    staleTime: 5 * 60 * 1000,
  });
}
