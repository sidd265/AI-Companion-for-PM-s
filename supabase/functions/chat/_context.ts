/**
 * Intent detection and context orchestration.
 *
 * 1. Analyses the conversation to understand what the PM is asking about.
 * 2. Fires GitHub and/or Jira fetches in parallel based on detected intent.
 * 3. Returns a single combined context string ready to inject into Gemini.
 */

import type { ChatMessage, DetectedIntent, UserIntegrations } from './_types.ts';
import { buildGitHubContext } from './_github.ts';
import { buildJiraContext } from './_jira.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Signal word lists
// ─────────────────────────────────────────────────────────────────────────────

const GITHUB_SIGNALS = new Set([
  'pull request', 'pr', 'prs', 'merge', 'merged', 'branch', 'commit', 'commits',
  'review', 'reviewer', 'reviewers', 'repository', 'repo', 'repos', 'repositories',
  'code', 'diff', 'push', 'pushed', 'contributor', 'contributors', 'fork',
  'who worked on', 'recent changes', 'open pr', 'closed pr', 'changes',
  'codebase', 'source', 'file', 'files', 'readme', 'workflow', 'action',
]);

const JIRA_SIGNALS = new Set([
  'ticket', 'tickets', 'issue', 'issues', 'jira', 'sprint', 'sprints',
  'backlog', 'story', 'stories', 'epic', 'epics', 'task', 'tasks', 'bug', 'bugs',
  'blocked', 'blocker', 'blockers', 'status', 'priority', 'assign', 'assignee',
  'unassigned', 'done', 'in progress', 'in review', 'to do', 'feature', 'fix',
  'project', 'projects', 'velocity', 'burndown', 'roadmap', 'milestone',
  'workload', 'capacity',
]);

const SPRINT_SIGNALS = new Set([
  'sprint', 'velocity', 'burndown', 'sprint status', 'sprint progress',
  'current sprint', 'active sprint',
]);

const BLOCKED_SIGNALS = new Set([
  'blocked', 'blocker', 'blockers', 'stuck', 'impediment',
]);

const ASSIGNMENT_SIGNALS = new Set([
  'assign', 'who should', 'best person', 'recommend', 'ownership',
  'unassigned', 'workload', 'capacity', 'available',
]);

const PR_REVIEW_SIGNALS = new Set([
  'review', 'reviewer', 'needs review', 'code review', 'approve', 'approved',
  'pending review', 'who should review',
]);

const COMMIT_SIGNALS = new Set([
  'commit', 'commits', 'push', 'pushed', 'recent changes', 'history',
  'what changed', 'changelog', 'who changed',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Intent detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyses the last user message (and recent context) to decide what data
 * to fetch before calling Gemini. Uses keyword matching — no extra LLM call.
 */
export function detectIntent(messages: ChatMessage[]): DetectedIntent {
  // Use the last 3 user messages for context (handles follow-up questions)
  const recentUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content)
    .join(' ');

  const text  = recentUserMessages.toLowerCase();
  const words = text.split(/[\s,?.!;:()\[\]]+/).filter(w => w.length > 2);

  // Ticket key pattern: PROJ-1234
  const ticketMatch = recentUserMessages.match(/\b([A-Z][A-Z0-9]+-\d{1,6})\b/);

  // Jira project key: uppercase word 2-10 chars before a hyphen or at word boundary
  const projectMatch = recentUserMessages.match(/\bproject[:\s]+([A-Z][A-Z0-9]{1,9})\b/i)
    ?? recentUserMessages.match(/\b([A-Z]{2,10})\s+project\b/i);

  // Repo name extraction — match common slug patterns
  const repoMatch = recentUserMessages.match(/\b([\w-]{3,40}(?:-service|-api|-frontend|-backend|-app|-web|-gateway))\b/i)
    ?? recentUserMessages.match(/repo(?:sitory)?\s+([A-Za-z][\w-]{2,39})/i);

  const hasSignal = (signals: Set<string>): boolean =>
    [...signals].some(s => text.includes(s));

  const needsGitHub = hasSignal(GITHUB_SIGNALS);
  const needsJira   = hasSignal(JIRA_SIGNALS) || !!ticketMatch;

  return {
    needsGitHub,
    needsJira,
    keywords: [...new Set(words.filter(w => w.length > 3))].slice(0, 12),
    repoHint: repoMatch ? repoMatch[1].toLowerCase() : undefined,
    projectHint: projectMatch ? projectMatch[1].toUpperCase() : undefined,
    ticketHint: ticketMatch?.[1] ?? undefined,
    wantsSprintStatus:   hasSignal(SPRINT_SIGNALS),
    wantsBlockedItems:   hasSignal(BLOCKED_SIGNALS),
    wantsAssignment:     hasSignal(ASSIGNMENT_SIGNALS),
    wantsPRReview:       hasSignal(PR_REVIEW_SIGNALS),
    wantsCommits:        hasSignal(COMMIT_SIGNALS),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Parallel context fetch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches GitHub and Jira context in parallel.
 * If one source fails, the other still contributes — the chat never fails
 * just because a data source is unavailable.
 */
export async function fetchContext(
  intent: DetectedIntent,
  integrations: UserIntegrations,
): Promise<string> {
  const fetches: Promise<string>[] = [];

  if (intent.needsGitHub && integrations.github) {
    fetches.push(
      buildGitHubContext(integrations.github, intent).catch(err => {
        console.error('GitHub context error (non-fatal):', err);
        return '<github_error>GitHub data temporarily unavailable</github_error>';
      }),
    );
  }

  if (intent.needsJira && integrations.jira) {
    fetches.push(
      buildJiraContext(integrations.jira, intent).catch(err => {
        console.error('Jira context error (non-fatal):', err);
        return '<jira_error>Jira data temporarily unavailable</jira_error>';
      }),
    );
  }

  if (fetches.length === 0) return '';

  const results = await Promise.allSettled(fetches);
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value.trim())
    .filter(Boolean)
    .join('\n\n');
}
