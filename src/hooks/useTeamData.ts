/**
 * React Query hooks for team data.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTeamMembers, fetchTeamStats, fetchAllExpertise, type TeamFilters } from '@/services/team';

const STALE_TIME = 5 * 60 * 1000;

export function useTeamMembers(filters?: TeamFilters) {
  return useQuery({
    queryKey: ['team', 'members', filters],
    queryFn: () => fetchTeamMembers(filters),
    staleTime: STALE_TIME,
  });
}

export function useTeamStats() {
  return useQuery({
    queryKey: ['team', 'stats'],
    queryFn: fetchTeamStats,
    staleTime: STALE_TIME,
  });
}

export function useAllExpertise() {
  return useQuery({
    queryKey: ['team', 'expertise'],
    queryFn: fetchAllExpertise,
    staleTime: STALE_TIME,
  });
}
