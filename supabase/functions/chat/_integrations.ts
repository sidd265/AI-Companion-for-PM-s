/**
 * Loads per-user integration credentials and team data from Supabase.
 * Uses the user's JWT so Supabase RLS enforces they can only read their own records.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { UserIntegrations, GitHubCreds, JiraCreds, TeamMemberContext } from './_types.ts';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

/**
 * Returns a Supabase client that acts as the authenticated user
 * (respects RLS policies — users can only see their own integrations).
 */
function userClient(jwt: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Integration credentials
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads the user's GitHub and Jira credentials from the integrations table.
 * Returns only connected integrations with valid tokens.
 */
export async function getUserIntegrations(jwt: string): Promise<UserIntegrations> {
  const supabase = userClient(jwt);

  const { data, error } = await supabase
    .from('integrations')
    .select('type, access_token, metadata')
    .eq('status', 'connected');

  if (error) {
    console.error('Failed to load integrations:', error.message);
    return {};
  }

  const result: UserIntegrations = {};

  for (const row of data ?? []) {
    const meta = (row.metadata as Record<string, string>) ?? {};

    if (row.type === 'github' && row.access_token) {
      result.github = {
        token: row.access_token,
        username: meta.username,
        org: meta.org,
      } as GitHubCreds;
    }

    if (row.type === 'jira' && row.access_token && meta.base_url && meta.email) {
      result.jira = {
        baseUrl: meta.base_url.replace(/\/$/, ''), // strip trailing slash
        email: meta.email,
        apiToken: row.access_token,
      } as JiraCreds;
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Team members
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads team members from Supabase so the AI can suggest assignments
 * based on expertise and current capacity.
 */
export async function getTeamMembers(jwt: string): Promise<TeamMemberContext[]> {
  const supabase = userClient(jwt);

  const { data, error } = await supabase
    .from('team_members')
    .select('name, role, github, expertise, capacity, active_tasks')
    .order('name');

  if (error) {
    console.error('Failed to load team members:', error.message);
    return [];
  }

  return (data ?? []).map(row => ({
    name: row.name ?? 'Unknown',
    role: row.role ?? '',
    github: row.github ?? undefined,
    expertise: Array.isArray(row.expertise) ? row.expertise : [],
    capacity: typeof row.capacity === 'number' ? row.capacity : 100,
    activeTasks: typeof row.active_tasks === 'number' ? row.active_tasks : 0,
  }));
}

/**
 * Formats team members as a compact XML context block.
 */
export function formatTeamContext(members: TeamMemberContext[]): string {
  if (members.length === 0) return '';
  const lines = members.map(m => {
    const parts = [
      `  ${m.name} (${m.role})`,
      `  expertise: ${m.expertise.join(', ') || 'general'}`,
      `  capacity: ${m.capacity}% | active tasks: ${m.activeTasks}`,
      m.github ? `  github: ${m.github}` : null,
    ].filter(Boolean).join('\n');
    return parts;
  });
  return `<team_context>\n${lines.join('\n\n')}\n</team_context>`;
}
