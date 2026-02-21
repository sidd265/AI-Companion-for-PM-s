/**
 * React Query hooks for user profile data.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '@/services/settings';

const STALE_TIME = 5 * 60 * 1000;

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: STALE_TIME,
  });
}
