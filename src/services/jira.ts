/**
 * Jira sync service.
 * Syncs Jira issues → Supabase tickets table.
 */

import { supabase } from '@/lib/supabase';
import { getJiraCredentials } from '@/services/integrations';
import {
  fetchJiraIssues,
  mapJiraStatus,
  mapJiraPriority,
  mapJiraIssueType,
  extractTextFromADF,
} from '@/lib/jira';
import type { JiraIssue } from '@/lib/jira';

// ---------------------------------------------------------------------------
// Project lookup/creation
// ---------------------------------------------------------------------------

async function ensureProject(projectKey: string, projectName: string): Promise<string | null> {
  // Check if project exists
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('key', projectKey)
    .single();

  if (existing) return (existing as { id: string }).id;

  // Create project — need owner_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: created, error } = await supabase
    .from('projects')
    .insert({ name: projectName, key: projectKey, owner_id: user.id })
    .select('id')
    .single();

  if (error || !created) return null;
  return (created as { id: string }).id;
}

// ---------------------------------------------------------------------------
// Issue → ticket row mapping
// ---------------------------------------------------------------------------

function issueToTicketRow(issue: JiraIssue, projectId: string) {
  return {
    title: issue.fields.summary,
    description: extractTextFromADF(issue.fields.description),
    status: mapJiraStatus(issue.fields.status.statusCategory.key),
    priority: mapJiraPriority(issue.fields.priority?.name),
    type: mapJiraIssueType(issue.fields.issuetype.name),
    project_id: projectId,
    jira_key: issue.key,
    jira_issue_id: issue.id,
    jira_source: true,
    story_points: issue.fields.customfield_10016 ?? null,
  };
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export async function syncJiraTickets(): Promise<{ synced: number; errors: number }> {
  const creds = await getJiraCredentials();
  if (!creds) return { synced: 0, errors: 0 };

  try {
    const issues = await fetchJiraIssues(
      creds.cloudId,
      creds.accessToken,
      creds.refreshToken,
      'ORDER BY updated DESC',
      200,
    );

    // Group issues by project for batch project lookup
    const projectMap = new Map<string, { key: string; name: string; id: string | null }>();
    for (const issue of issues) {
      const pk = issue.fields.project.key;
      if (!projectMap.has(pk)) {
        projectMap.set(pk, { key: pk, name: issue.fields.project.name, id: null });
      }
    }

    // Ensure all projects exist
    for (const [key, proj] of projectMap) {
      const id = await ensureProject(proj.key, proj.name);
      projectMap.set(key, { ...proj, id });
    }

    let synced = 0;
    let errors = 0;

    // Upsert tickets in batches
    const rows = [];
    for (const issue of issues) {
      const proj = projectMap.get(issue.fields.project.key);
      if (!proj?.id) { errors++; continue; }
      rows.push(issueToTicketRow(issue, proj.id));
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from('tickets')
        .upsert(rows, { onConflict: 'jira_issue_id', ignoreDuplicates: false });

      if (error) {
        errors += rows.length;
      } else {
        synced = rows.length;
      }
    }

    // Update lastSync timestamp on integrations row
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('integrations')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('type', 'jira');
    }

    return { synced, errors };
  } catch {
    return { synced: 0, errors: 1 };
  }
}
