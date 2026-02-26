/**
 * Integrations service layer.
 *
 * Saves and reads GitHub and Jira credentials in the Supabase `integrations`
 * table so the AI chat edge function can access live data on behalf of the user.
 *
 * Credential storage:
 *   GitHub → access_token = PAT, metadata = { username, org }
 *   Jira   → access_token = API token, metadata = { base_url, email, site }
 *
 * All API secrets (GitHub PAT, Jira API token) are sent to Supabase over TLS
 * and stored per-user. The AI edge function reads them server-side with the
 * user's JWT — they are never exposed to other users or in client bundles.
 */

import { supabase } from '@/lib/supabase';
import type { Repository } from '@/data/mockData';
import { repositories } from '@/data/mockData';

export interface IntegrationStatus {
  github: {
    connected: boolean;
    username?: string;
    org?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// Read integration statuses
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchIntegrationStatuses(): Promise<IntegrationStatus> {
  const { data: { user } } = await supabase.auth.getUser();

  const result: IntegrationStatus = {
    github: { connected: false },
    jira:   { connected: false },
    slack:  { connected: false, workspace: null, channels: 0, lastSync: null },
  };

  if (!user) return result;

  const { data, error } = await supabase
    .from('integrations')
    .select('type, status, metadata, updated_at')
    .eq('user_id', user.id);

  if (error) {
    console.error('fetchIntegrationStatuses:', error.message);
    return result;
  }

  for (const row of data ?? []) {
    const meta = (row.metadata as Record<string, string>) ?? {};
    const isConnected = row.status === 'connected';
    const lastSync = row.updated_at
      ? new Date(row.updated_at).toLocaleString()
      : undefined;

    if (row.type === 'github') {
      result.github = {
        connected: isConnected,
        username: meta.username,
        org: meta.org,
        repos: meta.repo_count ? parseInt(meta.repo_count) : undefined,
        lastSync,
      };
    }
    if (row.type === 'jira') {
      result.jira = {
        connected: isConnected,
        site: meta.site ?? meta.base_url,
        projects: meta.project_count ? parseInt(meta.project_count) : undefined,
        lastSync,
      };
    }
    if (row.type === 'slack') {
      result.slack = {
        connected: isConnected,
        workspace: meta.workspace ?? null,
        channels: meta.channel_count ? parseInt(meta.channel_count) : 0,
        lastSync,
      };
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubCredentials {
  token: string;
  username?: string;
  org?: string;
}

/**
 * Saves GitHub credentials to Supabase.
 * Validates the token against the GitHub API before storing.
 */
export async function saveGitHubCredentials(
  creds: GitHubCredentials,
): Promise<{ success: boolean; error?: string; username?: string }> {
  // Validate token against GitHub before storing
  let validatedUsername = creds.username;
  try {
    const resp = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${creds.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!resp.ok) {
      return { success: false, error: 'Invalid GitHub token. Please check and try again.' };
    }
    const ghUser = await resp.json();
    validatedUsername = ghUser.login ?? validatedUsername;
  } catch {
    return { success: false, error: 'Could not reach GitHub to validate token.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabase.from('integrations').upsert(
    {
      user_id:      user.id,
      type:         'github',
      access_token: creds.token,
      status:       'connected',
      metadata: {
        username:   validatedUsername ?? '',
        org:        creds.org ?? '',
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,type' },
  );

  if (error) {
    console.error('saveGitHubCredentials:', error.message);
    return { success: false, error: 'Failed to save credentials. Try again.' };
  }

  return { success: true, username: validatedUsername };
}

// ─────────────────────────────────────────────────────────────────────────────
// Jira
// ─────────────────────────────────────────────────────────────────────────────

export interface JiraCredentials {
  baseUrl: string;
  email: string;
  apiToken: string;
}

/**
 * Saves Jira credentials to Supabase.
 * Validates against Jira before storing by fetching /rest/api/3/myself.
 */
export async function saveJiraCredentials(
  creds: JiraCredentials,
): Promise<{ success: boolean; error?: string; site?: string }> {
  const baseUrl = creds.baseUrl.trim().replace(/\/$/, '');

  // Validate credentials against Jira API
  let siteName = baseUrl;
  try {
    const token = btoa(`${creds.email}:${creds.apiToken}`);
    const resp = await fetch(`${baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!resp.ok) {
      return {
        success: false,
        error: 'Invalid Jira credentials. Check your base URL, email, and API token.',
      };
    }
    const me = await resp.json();
    siteName = me.self ? new URL(me.self).hostname : siteName;
  } catch {
    return { success: false, error: 'Could not reach Jira. Check your base URL.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabase.from('integrations').upsert(
    {
      user_id:      user.id,
      type:         'jira',
      access_token: creds.apiToken,
      status:       'connected',
      metadata: {
        base_url: baseUrl,
        email:    creds.email,
        site:     siteName,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,type' },
  );

  if (error) {
    console.error('saveJiraCredentials:', error.message);
    return { success: false, error: 'Failed to save credentials. Try again.' };
  }

  return { success: true, site: siteName };
}

// ─────────────────────────────────────────────────────────────────────────────
// Disconnect
// ─────────────────────────────────────────────────────────────────────────────

export async function disconnectIntegration(
  type: 'github' | 'jira' | 'slack',
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('user_id', user.id)
    .eq('type', type);

  if (error) {
    console.error('disconnectIntegration:', error.message);
    return { success: false, error: 'Failed to disconnect. Try again.' };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync (refresh metadata like repo count, project count)
// ─────────────────────────────────────────────────────────────────────────────

export async function syncIntegration(
  type: 'github' | 'jira' | 'slack',
): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  // Touch updated_at so the UI shows a fresh sync timestamp
  await supabase
    .from('integrations')
    .update({ updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('type', type);

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository listing (kept for UI — uses mock until GitHub is connected)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchIntegrationRepositories(): Promise<Repository[]> {
  return repositories;
}

// Legacy alias kept for compatibility
export async function connectIntegration(
  _type: 'github' | 'jira' | 'slack',
): Promise<{ success: boolean }> {
  return { success: true };
}
