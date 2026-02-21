/**
 * React Query hooks for dashboard data.
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardStats,
  fetchRecentActivity,
  fetchTicketsByStatus,
  fetchTicketsByPriority,
  fetchTeamWorkload,
  fetchRepositorySummaries,
  fetchOpenPullRequests,
  fetchTotalTicketCount,
  fetchCurrentUser,
} from '@/services/dashboard';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: STALE_TIME,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: fetchRecentActivity,
    staleTime: STALE_TIME,
  });
}

export function useTicketsByStatus() {
  return useQuery({
    queryKey: ['dashboard', 'ticketsByStatus'],
    queryFn: fetchTicketsByStatus,
    staleTime: STALE_TIME,
  });
}

export function useTicketsByPriority() {
  return useQuery({
    queryKey: ['dashboard', 'ticketsByPriority'],
    queryFn: fetchTicketsByPriority,
    staleTime: STALE_TIME,
  });
}

export function useTeamWorkload() {
  return useQuery({
    queryKey: ['dashboard', 'teamWorkload'],
    queryFn: fetchTeamWorkload,
    staleTime: STALE_TIME,
  });
}

export function useRepositorySummaries() {
  return useQuery({
    queryKey: ['dashboard', 'repositories'],
    queryFn: fetchRepositorySummaries,
    staleTime: STALE_TIME,
  });
}

export function useOpenPullRequests() {
  return useQuery({
    queryKey: ['dashboard', 'openPRs'],
    queryFn: fetchOpenPullRequests,
    staleTime: STALE_TIME,
  });
}

export function useTotalTicketCount() {
  return useQuery({
    queryKey: ['dashboard', 'totalTicketCount'],
    queryFn: fetchTotalTicketCount,
    staleTime: STALE_TIME,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: STALE_TIME,
  });
}
