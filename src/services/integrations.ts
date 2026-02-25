/**
 * Integrations data service layer.
 * Queries Supabase integrations table.
 */

import { supabase } from '@/lib/supabase';
import { fetchGitHubRepos } from '@/lib/github';
import type { Repository } from '@/data/mockData';

export interface IntegrationStatus {
  github: {
    connected: boolean;
    username?: string;
    repos?: number;
    lastSync?: string;
  };
  jira: {
    connected: boolean;
    site?: string;
    projects?: number;
    lastSync?: string;
  };
  slack: {
    connected: boolean;
    workspace?: string | null;
    channels?: number;
    lastSync?: string | null;
  };
}

interface IntegrationRow {
  id: string;
  type: string;
  status: string;
  metadata: Record<string, unknown> | null;
  access_token: string | null;
  updated_at: string;
}

const EMPTY_STATUS: IntegrationStatus = {
  github: { connected: false },
  jira: { connected: false },
  slack: { connected: false, workspace: null, channels: 0, lastSync: null },
};

function rowsToStatus(rows: IntegrationRow[]): IntegrationStatus {
  const find = (type: string) => rows.find(r => r.type === type);

  const gh = find('github');
  const jr = find('jira');
  const sl = find('slack');

  return {
    github: {
      connected: gh?.status === 'connected',
      username: gh?.metadata?.username as string | undefined,
      repos: gh?.metadata?.repos as number | undefined,
      lastSync: gh?.updated_at,
    },
    jira: {
      connected: jr?.status === 'connected',
      site: jr?.metadata?.site as string | undefined,
      projects: jr?.metadata?.projects as number | undefined,
      lastSync: jr?.updated_at,
    },
    slack: {
      connected: sl?.status === 'connected',
      workspace: sl?.metadata?.workspace as string | null | undefined,
      channels: sl?.metadata?.channels as number | undefined,
      lastSync: sl?.updated_at ?? null,
    },
  };
}

/**
 * Fetch all integration statuses.
 */
export async function fetchIntegrationStatuses(): Promise<IntegrationStatus> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return EMPTY_STATUS;

  const { data, error } = await supabase
    .from('integrations')
    .select('id, type, status, metadata, access_token, updated_at')
    .eq('user_id', user.id);

  if (error || !data) return EMPTY_STATUS;

  return rowsToStatus(data as IntegrationRow[]);
}

/**
 * Get the stored GitHub OAuth token for the current user.
 * Returns null if GitHub is not connected.
 */
export async function getGitHubToken(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('integrations')
    .select('access_token')
    .eq('user_id', user.id)
    .eq('type', 'github')
    .eq('status', 'connected')
    .single();

  if (error || !data) return null;
  return (data as { access_token: string | null }).access_token;
}

/**
 * Fetch repositories using real GitHub API.
 */
export async function fetchIntegrationRepositories(): Promise<Repository[]> {
  const token = await getGitHubToken();
  if (!token) return [];
  return fetchGitHubRepos(token);
}

/**
 * Store GitHub OAuth token and metadata after OAuth redirect.
 */
export async function storeGitHubConnection(
  token: string,
  username: string,
  repoCount: number,
): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: user.id,
      type: 'github',
      status: 'connected',
      access_token: token,
      metadata: { username, repos: repoCount },
    }, { onConflict: 'user_id,type' });

  return { success: !error };
}

/**
 * Connect an integration (upsert row).
 */
export async function connectIntegration(type: 'github' | 'jira' | 'slack'): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('integrations')
    .upsert({ user_id: user.id, type, status: 'connected' }, { onConflict: 'user_id,type' });

  return { success: !error };
}

/**
 * Disconnect an integration.
 */
export async function disconnectIntegration(type: 'github' | 'jira' | 'slack'): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('integrations')
    .update({ status: 'disconnected', access_token: null, refresh_token: null, metadata: null })
    .eq('user_id', user.id)
    .eq('type', type);

  return { success: !error };
}

/**
 * Get stored Jira OAuth credentials for the current user.
 * Returns null if Jira is not connected.
 */
export async function getJiraCredentials(): Promise<{
  accessToken: string;
  refreshToken: string;
  cloudId: string;
  siteUrl: string;
} | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('integrations')
    .select('access_token, refresh_token, metadata')
    .eq('user_id', user.id)
    .eq('type', 'jira')
    .eq('status', 'connected')
    .single();

  if (error || !data) return null;
  const row = data as { access_token: string | null; refresh_token: string | null; metadata: Record<string, unknown> | null };
  if (!row.access_token || !row.refresh_token || !row.metadata?.cloud_id) return null;

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    cloudId: row.metadata.cloud_id as string,
    siteUrl: (row.metadata.site as string) ?? '',
  };
}

/**
 * Store Jira OAuth tokens and metadata after OAuth redirect.
 */
export async function storeJiraConnection(params: {
  accessToken: string;
  refreshToken: string;
  cloudId: string;
  siteName: string;
  siteUrl: string;
  projectCount: number;
}): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: user.id,
      type: 'jira',
      status: 'connected',
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
      metadata: {
        cloud_id: params.cloudId,
        site: params.siteUrl,
        site_name: params.siteName,
        projects: params.projectCount,
      },
    }, { onConflict: 'user_id,type' });

  return { success: !error };
}

/**
 * Trigger a sync for an integration.
 */
export async function syncIntegration(type: 'github' | 'jira' | 'slack'): Promise<{ success: boolean }> {
  if (type === 'jira') {
    const { syncJiraTickets } = await import('@/services/jira');
    const result = await syncJiraTickets();
    return { success: result.errors === 0 };
  }
  return { success: true };
}
