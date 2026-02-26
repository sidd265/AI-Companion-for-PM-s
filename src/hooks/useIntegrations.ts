/**
 * React Query hooks for integrations — read status, save credentials, disconnect.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIntegrationStatuses,
  fetchIntegrationRepositories,
  saveGitHubCredentials,
  saveJiraCredentials,
  disconnectIntegration,
  syncIntegration,
  type GitHubCredentials,
  type JiraCredentials,
} from '@/services/integrations';

const STALE_TIME = 2 * 60 * 1000;

// ─── Queries ─────────────────────────────────────────────────────────────────

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

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSaveGitHubCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: GitHubCredentials) => saveGitHubCredentials(creds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useSaveJiraCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: JiraCredentials) => saveJiraCredentials(creds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: 'github' | 'jira' | 'slack') => disconnectIntegration(type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useSyncIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: 'github' | 'jira' | 'slack') => syncIntegration(type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}
