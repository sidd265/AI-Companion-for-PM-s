/**
 * Jira Cloud REST API helper.
 * Makes authenticated requests using the user's OAuth token.
 * Auto-refreshes expired tokens via the jira-oauth edge function.
 */

import { supabase } from '@/lib/supabase';
import type { TicketTrendPoint, SprintBurndownPoint, SprintMeta } from '@/services/chartData';

const JIRA_API_BASE = 'https://api.atlassian.com/ex/jira';

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class JiraApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'JiraApiError';
  }
}

// ---------------------------------------------------------------------------
// Token refresh via edge function
// ---------------------------------------------------------------------------

async function refreshJiraToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const { data, error } = await supabase.functions.invoke('jira-oauth', {
    body: { action: 'refresh', refresh_token: refreshToken },
  });

  if (error || !data?.access_token) {
    throw new JiraApiError(401, 'Failed to refresh Jira token');
  }

  // Update stored tokens
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('integrations')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      .eq('user_id', user.id)
      .eq('type', 'jira');
  }

  return { access_token: data.access_token, refresh_token: data.refresh_token };
}

// ---------------------------------------------------------------------------
// Core fetch wrapper with auto-refresh
// ---------------------------------------------------------------------------

async function jiraFetch<T>(
  cloudId: string,
  path: string,
  token: string,
  refreshToken: string,
): Promise<T> {
  const url = `${JIRA_API_BASE}/${cloudId}${path}`;

  let res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  // Auto-refresh on 401
  if (res.status === 401) {
    const newTokens = await refreshJiraToken(refreshToken);
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${newTokens.access_token}`,
        Accept: 'application/json',
      },
    });
  }

  if (!res.ok) throw new JiraApiError(res.status, `Jira API error: ${res.status}`);

  return res.json() as Promise<T>;
}

// Agile API uses a different base
async function jiraAgileFetch<T>(
  cloudId: string,
  path: string,
  token: string,
  refreshToken: string,
): Promise<T> {
  return jiraFetch<T>(cloudId, path.replace('/rest/agile/', '/rest/agile/'), token, refreshToken);
}

// ---------------------------------------------------------------------------
// Jira API response types
// ---------------------------------------------------------------------------

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraIssueFields {
  summary: string;
  description: unknown;
  status: { name: string; statusCategory: { key: string; name: string } };
  priority: { name: string } | null;
  issuetype: { name: string };
  project: { id: string; key: string; name: string };
  assignee: { displayName: string; accountId: string } | null;
  created: string;
  updated: string;
  resolutiondate: string | null;
  // Story points — customfield_10016 is the Jira Cloud default
  customfield_10016?: number | null;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
}

interface JiraSearchResult {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
}

interface JiraSprint {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string;
  endDate: string;
  goal: string | null;
}

interface JiraBoard {
  id: number;
  name: string;
  type: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchJiraProjects(
  cloudId: string,
  token: string,
  refreshToken: string,
): Promise<JiraProject[]> {
  return jiraFetch<JiraProject[]>(cloudId, '/rest/api/3/project', token, refreshToken);
}

export async function fetchJiraIssues(
  cloudId: string,
  token: string,
  refreshToken: string,
  jql: string = 'ORDER BY updated DESC',
  maxResults: number = 200,
): Promise<JiraIssue[]> {
  const params = new URLSearchParams({
    jql,
    maxResults: String(maxResults),
    fields: 'summary,description,status,priority,issuetype,project,assignee,customfield_10016,created,updated,resolutiondate',
  });

  const result = await jiraFetch<JiraSearchResult>(
    cloudId,
    `/rest/api/3/search?${params}`,
    token,
    refreshToken,
  );

  return result.issues;
}

export async function fetchJiraBoards(
  cloudId: string,
  token: string,
  refreshToken: string,
): Promise<JiraBoard[]> {
  const result = await jiraAgileFetch<{ values: JiraBoard[] }>(
    cloudId,
    '/rest/agile/1.0/board?type=scrum&maxResults=10',
    token,
    refreshToken,
  );
  return result.values;
}

async function fetchActiveSprint(
  cloudId: string,
  token: string,
  refreshToken: string,
  boardId: number,
): Promise<JiraSprint | null> {
  const result = await jiraAgileFetch<{ values: JiraSprint[] }>(
    cloudId,
    `/rest/agile/1.0/board/${boardId}/sprint?state=active`,
    token,
    refreshToken,
  );
  return result.values[0] ?? null;
}

async function fetchSprintIssues(
  cloudId: string,
  token: string,
  refreshToken: string,
  sprintId: number,
): Promise<JiraIssue[]> {
  const result = await jiraAgileFetch<{ issues: JiraIssue[] }>(
    cloudId,
    `/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=200&fields=summary,status,resolutiondate,customfield_10016,created,updated`,
    token,
    refreshToken,
  );
  return result.issues;
}

// ---------------------------------------------------------------------------
// Status / Priority / Type mapping
// ---------------------------------------------------------------------------

export function mapJiraStatus(statusCategory: string): string {
  switch (statusCategory) {
    case 'new': return 'To Do';
    case 'indeterminate': return 'In Progress';
    case 'done': return 'Done';
    default: return 'To Do';
  }
}

export function mapJiraPriority(priorityName: string | undefined): string {
  if (!priorityName) return 'Medium';
  const lower = priorityName.toLowerCase();
  if (lower === 'highest' || lower === 'high') return 'High';
  if (lower === 'medium') return 'Medium';
  if (lower === 'lowest' || lower === 'low') return 'Low';
  if (lower === 'critical' || lower === 'blocker') return 'Critical';
  return 'Medium';
}

export function mapJiraIssueType(typeName: string): string {
  const lower = typeName.toLowerCase();
  if (lower === 'bug') return 'Bug';
  if (lower === 'story' || lower === 'user story') return 'Story';
  if (lower === 'epic') return 'Epic';
  return 'Task';
}

// ---------------------------------------------------------------------------
// Atlassian Document Format → plain text
// ---------------------------------------------------------------------------

export function extractTextFromADF(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';

  const node = doc as { type?: string; text?: string; content?: unknown[] };
  if (node.type === 'text' && typeof node.text === 'string') return node.text;

  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromADF).join('');
  }

  return '';
}

// ---------------------------------------------------------------------------
// Chart data: Ticket Trends
// ---------------------------------------------------------------------------

export async function fetchTicketTrendsFromJira(
  cloudId: string,
  token: string,
  refreshToken: string,
): Promise<TicketTrendPoint[]> {
  // Fetch issues created in the last 14 days
  const issues = await fetchJiraIssues(
    cloudId, token, refreshToken,
    'created >= -14d ORDER BY created ASC',
    500,
  );

  // Build date-bucketed trend data
  const now = new Date();
  const points: TicketTrendPoint[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    let created = 0;
    let completed = 0;
    let inProgress = 0;

    for (const issue of issues) {
      const createdDate = new Date(issue.fields.created);
      if (createdDate >= dayStart && createdDate < dayEnd) created++;

      if (issue.fields.resolutiondate) {
        const resolvedDate = new Date(issue.fields.resolutiondate);
        if (resolvedDate >= dayStart && resolvedDate < dayEnd) completed++;
      }

      // Count in-progress as of end of day: created before dayEnd and not resolved before dayEnd
      if (createdDate < dayEnd) {
        const catKey = issue.fields.status.statusCategory.key;
        if (catKey === 'indeterminate') {
          if (!issue.fields.resolutiondate || new Date(issue.fields.resolutiondate) >= dayEnd) {
            inProgress++;
          }
        }
      }
    }

    points.push({ date: dateStr, created, completed, inProgress });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Chart data: Sprint Burndown
// ---------------------------------------------------------------------------

export async function fetchSprintBurndownFromJira(
  cloudId: string,
  token: string,
  refreshToken: string,
): Promise<{ data: SprintBurndownPoint[]; meta: SprintMeta } | null> {
  // Find a scrum board
  const boards = await fetchJiraBoards(cloudId, token, refreshToken);
  if (boards.length === 0) return null;

  const board = boards[0];

  // Find active sprint
  const sprint = await fetchActiveSprint(cloudId, token, refreshToken, board.id);
  if (!sprint) return null;

  // Fetch sprint issues
  const issues = await fetchSprintIssues(cloudId, token, refreshToken, sprint.id);

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);

  // Calculate total story points
  const totalPoints = issues.reduce((sum, i) => sum + (i.fields.customfield_10016 ?? 1), 0);

  const now = new Date();
  const currentDay = Math.min(
    Math.ceil((now.getTime() - startDate.getTime()) / 86400000),
    totalDays,
  );

  const data: SprintBurndownPoint[] = [];
  let completedSoFar = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dayDate = new Date(startDate.getTime() + day * 86400000);
    const ideal = totalPoints - (totalPoints / totalDays) * day;
    const isFuture = day > currentDay;

    // Count points completed on this day
    if (!isFuture) {
      const prevDayDate = new Date(startDate.getTime() + (day - 1) * 86400000);
      for (const issue of issues) {
        if (issue.fields.resolutiondate) {
          const resolved = new Date(issue.fields.resolutiondate);
          if (resolved >= prevDayDate && resolved < dayDate) {
            completedSoFar += issue.fields.customfield_10016 ?? 1;
          }
        }
      }
    }

    data.push({
      day: `Day ${day}`,
      remaining: isFuture ? null : totalPoints - completedSoFar,
      ideal: Math.round(ideal * 10) / 10,
      completed: isFuture ? null : completedSoFar,
    });
  }

  return {
    data,
    meta: {
      currentDay,
      totalDays,
      totalPoints,
      completedPoints: completedSoFar,
    },
  };
}
