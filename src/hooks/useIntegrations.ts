/**
 * React Query hooks for integrations data.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchIntegrationStatuses, fetchIntegrationRepositories } from '@/services/integrations';

const STALE_TIME = 5 * 60 * 1000;

export function useIntegrationStatuses() {
  return useQuery({
    queryKey: ['integrations', 'statuses'],
    queryFn: fetchIntegrationStatuses,
    staleTime: STALE_TIME,
  });
}

export function useIntegrationRepositories() {
  return useQuery({
    queryKey: ['integrations', 'repositories'],
    queryFn: fetchIntegrationRepositories,
    staleTime: STALE_TIME,
  });
}
