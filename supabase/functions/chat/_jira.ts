/**
 * Jira deep-crawl helpers.
 *
 * Crawls the user's connected Jira instance to build rich context:
 * - All accessible projects
 * - Active sprint issues (via Jira Agile API)
 * - JQL-based ticket search (keyword, blocked, assignment queries)
 * - Full ticket detail with comments for exact-key lookups
 *
 * Uses the user's email + API token (HTTP Basic Auth) — never hardcoded.
 *
 * Security:
 * - JQL injection: user keywords are escaped and length-capped before interpolation
 * - Ticket keys are validated against /^[A-Z][A-Z0-9]+-\d{1,6}$/ before use
 * - Project keys are validated against /^[A-Z][A-Z0-9]{0,9}$/
 * - All external text is sanitized before embedding in Gemini prompts
 */

import type { DetectedIntent, JiraCreds, JiraProjectSummary, JiraIssue } from './_types.ts';
import { sanitizeExternalText } from './_security.ts';

const FIELDS_BASE  = 'summary,status,priority,assignee,reporter,project,issuetype,created,updated,labels';
const FIELDS_FULL  = `${FIELDS_BASE},description,comment,parent,sprint`;
const MAX_RESULTS  = 20;
const BODY_MAX     = 400;
const COMMENT_MAX  = 200;

function jiraHeaders(creds: JiraCreds): HeadersInit {
  const token = btoa(`${creds.email}:${creds.apiToken}`);
  return {
    'Authorization': `Basic ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

async function jiraFetch(creds: JiraCreds, path: string): Promise<unknown | null> {
  try {
    const url = `${creds.baseUrl}${path}`;
    const resp = await fetch(url, { headers: jiraHeaders(creds) });
    if (resp.status === 404) return null;
    if (!resp.ok) {
      console.error(`Jira ${path} → ${resp.status}: ${await resp.text()}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`Jira fetch error ${path}:`, e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Injection-safe JQL helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Removes characters that break JQL string literals. */
function escapeJQL(value: string): string {
  return value
    .replace(/["\\]/g, '')       // remove quotes and backslashes
    .replace(/[();]/g, '')       // remove JQL control chars
    .slice(0, 100)               // hard length cap
    .trim();
}

/** Validates a Jira ticket key: e.g. PROJ-1234. Returns undefined if invalid. */
function safeTicketKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return /^[A-Z][A-Z0-9]+-\d{1,6}$/.test(key) ? key : undefined;
}

/** Validates a Jira project key: e.g. PROJ, WEB2. Returns undefined if invalid. */
function safeProjectKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return /^[A-Z][A-Z0-9]{0,9}$/.test(key) ? key : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllProjects(creds: JiraCreds): Promise<JiraProjectSummary[]> {
  const data = await jiraFetch(
    creds,
    '/rest/api/3/project/search?maxResults=50&orderBy=name',
  ) as any | null;

  return (data?.values ?? []).map((p: any) => ({
    key: p.key ?? '',
    name: p.name ?? '',
    type: p.projectTypeKey ?? 'software',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Issue search via JQL
// ─────────────────────────────────────────────────────────────────────────────

async function searchIssues(
  creds: JiraCreds,
  jql: string,
  fields: string = FIELDS_BASE,
  maxResults: number = MAX_RESULTS,
): Promise<JiraIssue[]> {
  const path = `/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${fields}&maxResults=${maxResults}`;
  const data = await jiraFetch(creds, path) as any | null;
  return (data?.issues ?? []).map(mapIssue(creds));
}

// ─────────────────────────────────────────────────────────────────────────────
// Active sprint (Jira Agile API)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchActiveSprintIssues(
  creds: JiraCreds,
  projectKey?: string,
): Promise<JiraIssue[]> {
  // JQL for active sprint is the most reliable cross-API approach
  const projectClause = safeProjectKey(projectKey)
    ? `project = "${safeProjectKey(projectKey)}" AND `
    : '';
  const jql = `${projectClause}sprint in openSprints() ORDER BY priority DESC, updated DESC`;
  return searchIssues(creds, jql, FIELDS_BASE, 30);
}

// ─────────────────────────────────────────────────────────────────────────────
// Single ticket with full details + comments
// ─────────────────────────────────────────────────────────────────────────────

async function fetchTicketDetail(creds: JiraCreds, key: string): Promise<JiraIssue | null> {
  const safe = safeTicketKey(key);
  if (!safe) return null;

  const data = await jiraFetch(
    creds,
    `/rest/api/3/issue/${safe}?fields=${FIELDS_FULL}`,
  ) as any | null;
  if (!data) return null;

  const base = mapIssue(creds)(data);

  // Append recent comments
  const comments: any[] = data.fields?.comment?.comments ?? [];
  const commentSnippets = comments
    .slice(-3) // last 3 comments
    .map(c => {
      const text = extractADFText(c.body);
      return text ? `    [${c.author?.displayName ?? 'unknown'} @ ${(c.created ?? '').slice(0, 10)}]: ${sanitizeExternalText(text, COMMENT_MAX)}` : null;
    })
    .filter(Boolean)
    .join('\n');

  if (commentSnippets) {
    base.descriptionSnippet = (base.descriptionSnippet ? base.descriptionSnippet + '\n  Recent comments:\n' : 'Recent comments:\n') + commentSnippets;
  }

  return base;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context assembly
// ─────────────────────────────────────────────────────────────────────────────

export async function buildJiraContext(
  creds: JiraCreds,
  intent: DetectedIntent,
): Promise<string> {
  const parts: string[] = [];
  const validTicket  = safeTicketKey(intent.ticketHint);
  const validProject = safeProjectKey(intent.projectHint);

  // ── 1. Project inventory (always) ──
  const projects = await fetchAllProjects(creds);
  if (projects.length > 0) {
    const lines = projects.map(p => `  ${p.key}: ${p.name} (${p.type})`);
    parts.push(`<jira_projects>\n${lines.join('\n')}\n</jira_projects>`);
  }

  const issues: JiraIssue[] = [];

  // ── 2. Exact ticket lookup ──
  if (validTicket) {
    const detail = await fetchTicketDetail(creds, validTicket);
    if (detail) issues.push(detail);
  }

  // ── 3. Sprint status ──
  if (intent.wantsSprintStatus || intent.keywords.some(k => ['sprint', 'velocity', 'burndown'].includes(k))) {
    const sprintIssues = await fetchActiveSprintIssues(creds, validProject);
    issues.push(...sprintIssues.filter(i => !issues.some(e => e.key === i.key)));
    if (sprintIssues.length > 0) {
      // Sprint summary statistics
      const done       = sprintIssues.filter(i => i.status === 'Done').length;
      const inProgress = sprintIssues.filter(i => i.status === 'In Progress').length;
      const blocked    = sprintIssues.filter(i => i.status === 'Blocked').length;
      const toDo       = sprintIssues.filter(i => i.status === 'To Do').length;
      const total      = sprintIssues.length;
      const sprintLines = [
        `<jira_sprint_summary>`,
        `  total=${total} | done=${done} | in_progress=${inProgress} | to_do=${toDo} | blocked=${blocked}`,
        `  completion=${Math.round((done / total) * 100)}%`,
        `</jira_sprint_summary>`,
      ].join('\n');
      parts.push(sprintLines);
    }
  }

  // ── 4. Blocked items ──
  if (intent.wantsBlockedItems || intent.keywords.some(k => ['blocked', 'blocker', 'stuck'].includes(k))) {
    const projectClause = validProject ? `project = "${validProject}" AND ` : '';
    const blocked = await searchIssues(creds, `${projectClause}status = "Blocked" ORDER BY priority DESC`);
    blocked.forEach(i => { if (!issues.some(e => e.key === i.key)) issues.push(i); });
  }

  // ── 5. Assignment / workload queries ──
  if (intent.wantsAssignment) {
    const projectClause = validProject ? `project = "${validProject}" AND ` : '';
    const unassigned = await searchIssues(
      creds,
      `${projectClause}assignee is EMPTY AND status != "Done" ORDER BY priority DESC`,
      FIELDS_BASE,
      10,
    );
    unassigned.forEach(i => { if (!issues.some(e => e.key === i.key)) issues.push(i); });
  }

  // ── 6. Keyword search ──
  if (intent.keywords.length > 0 && !validTicket) {
    const safeTerm = escapeJQL(intent.keywords.slice(0, 4).join(' '));
    if (safeTerm.length > 2) {
      const projectClause = validProject ? `project = "${validProject}" AND ` : '';
      const jql = `${projectClause}text ~ "${safeTerm}" AND status != "Done" ORDER BY updated DESC`;
      const found = await searchIssues(creds, jql);
      found.forEach(i => { if (!issues.some(e => e.key === i.key)) issues.push(i); });
    }
  }

  // ── 7. Format collected issues ──
  if (issues.length > 0) {
    const lines = issues.map(i => {
      const labels = i.labels.length > 0 ? ` | labels: [${i.labels.join(', ')}]` : '';
      const sprint = i.sprint ? ` | sprint: ${i.sprint}` : '';
      const comment = i.commentCount ? ` | comments: ${i.commentCount}` : '';
      return [
        `  [${i.type.toUpperCase()}] ${i.key}: "${i.title}"`,
        `  status=${i.status} | priority=${i.priority} | project=${i.project}${sprint}`,
        `  assignee=${i.assignee ?? 'unassigned'} | reporter=${i.reporter ?? 'unknown'} | updated=${i.updatedAt}${labels}${comment}`,
        i.descriptionSnippet ? `  description: ${i.descriptionSnippet}` : null,
      ].filter(Boolean).join('\n');
    });
    parts.push(`<jira_context>\n${lines.join('\n\n')}\n</jira_context>`);
  }

  return parts.join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extracts plain text from Atlassian Document Format (ADF). */
function extractADFText(adf: any): string {
  if (!adf || typeof adf !== 'object') return '';
  try {
    const texts: string[] = [];
    function traverse(node: any) {
      if (node.type === 'text' && node.text) texts.push(node.text);
      if (Array.isArray(node.content)) node.content.forEach(traverse);
    }
    traverse(adf);
    return texts.join(' ').slice(0, BODY_MAX);
  } catch {
    return '';
  }
}

/** Maps a raw Jira API issue object to JiraIssue. */
function mapIssue(creds: JiraCreds) {
  return (issue: any): JiraIssue => {
    const fields = issue.fields ?? {};
    const description = extractADFText(fields.description);
    // Sprint field can come from different custom field paths
    const sprintField = fields.sprint ?? fields['customfield_10020']?.[0];
    const sprint = sprintField?.name ?? undefined;

    return {
      key: issue.key ?? '',
      title: sanitizeExternalText(fields.summary, 200),
      status: fields.status?.name ?? 'Unknown',
      priority: fields.priority?.name ?? 'Medium',
      type: fields.issuetype?.name ?? 'Task',
      project: fields.project?.name ?? '',
      projectKey: fields.project?.key ?? '',
      assignee: fields.assignee?.displayName ?? undefined,
      reporter: fields.reporter?.displayName ?? undefined,
      labels: Array.isArray(fields.labels) ? fields.labels : [],
      sprint,
      createdAt: (fields.created ?? '').slice(0, 10),
      updatedAt: (fields.updated ?? '').slice(0, 10),
      url: `${creds.baseUrl}/browse/${issue.key}`,
      descriptionSnippet: description ? sanitizeExternalText(description, BODY_MAX) : undefined,
      commentCount: fields.comment?.total ?? undefined,
    };
  };
}
