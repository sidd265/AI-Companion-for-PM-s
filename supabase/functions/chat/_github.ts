/**
 * GitHub deep-crawl helpers.
 *
 * Crawls the user's connected GitHub account to build rich context:
 * - Full repository inventory (all accessible repos)
 * - Open pull requests with reviewer and diff metadata
 * - Open issues
 * - Recent commits
 * - README snippets for key repos
 *
 * Uses the user's Personal Access Token so results are scoped to their
 * own repositories and orgs — no hardcoded org names needed.
 *
 * Security:
 * - All user-supplied keywords are URL-encoded before use in query strings
 * - External text is sanitized before embedding in Gemini prompts
 * - Fetch failures per-repo are caught and skipped silently
 */

import { buildDemoGitHubContext } from './_demo.ts';

import type {
  DetectedIntent,
  GitHubCreds,
  RepoSummary,
  PRDetail,
  IssueDetail,
  CommitSummary,
} from './_types.ts';
import { sanitizeExternalText } from './_security.ts';

// GitHub rate: 5,000 requests/hour per PAT. We batch carefully.
const GH_BASE = 'https://api.github.com';
const PER_PAGE_REPOS   = 50;  // max repos to inventory
const PER_PAGE_PRS     = 15;  // open PRs per repo (or cross-repo)
const PER_PAGE_ISSUES  = 10;
const PER_PAGE_COMMITS = 10;
const MAX_DEEP_REPOS   = 5;   // repos to deep-crawl per request
const README_MAX_CHARS = 800;
const BODY_MAX_CHARS   = 500;

function ghHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'AI-Companion-for-PMs/1.0',
  };
}

async function ghFetch(token: string, path: string): Promise<unknown | null> {
  try {
    const url = path.startsWith('http') ? path : `${GH_BASE}${path}`;
    const resp = await fetch(url, { headers: ghHeaders(token) });
    if (resp.status === 404) return null;
    if (!resp.ok) {
      console.error(`GitHub ${path} → ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`GitHub fetch error ${path}:`, e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Repo inventory — always fetched, gives the AI a full picture
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllRepos(creds: GitHubCreds): Promise<RepoSummary[]> {
  // Fetch repos the token owner has access to (personal + org repos)
  let url = `/user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=${PER_PAGE_REPOS}&type=all`;
  if (creds.org) {
    // Prefer org-scoped listing if org is specified
    url = `/orgs/${encodeURIComponent(creds.org)}/repos?sort=updated&per_page=${PER_PAGE_REPOS}&type=all`;
  }

  const data = await ghFetch(creds.token, url) as any[] | null;
  if (!data) return [];

  return data.map(repo => ({
    fullName: repo.full_name ?? '',
    name: repo.name ?? '',
    description: sanitizeExternalText(repo.description, 200),
    language: repo.language ?? 'unknown',
    stars: repo.stargazers_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    updatedAt: (repo.updated_at ?? '').slice(0, 10),
    topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 8) : [],
    readmeSnippet: undefined,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// README — gives the AI understanding of what each repo actually does
// ─────────────────────────────────────────────────────────────────────────────

async function fetchReadmeSnippet(token: string, fullName: string): Promise<string> {
  const data = await ghFetch(token, `/repos/${fullName}/readme`) as any | null;
  if (!data?.content) return '';
  try {
    const decoded = atob(data.content.replace(/\n/g, ''));
    return sanitizeExternalText(decoded, README_MAX_CHARS);
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pull requests
// ─────────────────────────────────────────────────────────────────────────────

async function fetchRepoPRs(
  token: string,
  fullName: string,
  state: 'open' | 'closed' | 'all' = 'open',
): Promise<PRDetail[]> {
  const data = await ghFetch(
    token,
    `/repos/${fullName}/pulls?state=${state}&sort=updated&direction=desc&per_page=${PER_PAGE_PRS}`,
  ) as any[] | null;
  if (!data) return [];

  return data.map(pr => ({
    repo: fullName.split('/')[1] ?? fullName,
    number: pr.number,
    title: sanitizeExternalText(pr.title, 200),
    state: pr.state,
    author: pr.user?.login ?? 'unknown',
    reviewers: [
      ...(pr.requested_reviewers ?? []).map((r: any) => r.login),
      ...(pr.requested_teams ?? []).map((t: any) => t.slug),
    ],
    labels: (pr.labels ?? []).map((l: any) => l.name),
    createdAt: (pr.created_at ?? '').slice(0, 10),
    updatedAt: (pr.updated_at ?? '').slice(0, 10),
    additions: pr.additions ?? 0,
    deletions: pr.deletions ?? 0,
    bodySnippet: sanitizeExternalText(pr.body, BODY_MAX_CHARS),
    url: pr.html_url ?? '',
  }));
}

/**
 * Searches open PRs across all user repos (no per-repo loop needed).
 */
async function fetchOrgWidePRs(creds: GitHubCreds, limit = 20): Promise<PRDetail[]> {
  const scope = creds.org
    ? `org:${encodeURIComponent(creds.org)}`
    : creds.username
      ? `user:${encodeURIComponent(creds.username)}`
      : '';

  if (!scope) return [];

  const data = await ghFetch(
    creds.token,
    `/search/issues?q=is:pr+is:open+${scope}&sort=updated&per_page=${limit}`,
  ) as any | null;

  return (data?.items ?? []).map((item: any) => ({
    repo: item.repository_url?.split('/').pop() ?? 'unknown',
    number: item.number,
    title: sanitizeExternalText(item.title, 200),
    state: item.state,
    author: item.user?.login ?? 'unknown',
    reviewers: [],
    labels: (item.labels ?? []).map((l: any) => l.name),
    createdAt: (item.created_at ?? '').slice(0, 10),
    updatedAt: (item.updated_at ?? '').slice(0, 10),
    additions: 0,
    deletions: 0,
    bodySnippet: sanitizeExternalText(item.body, 300),
    url: item.html_url ?? '',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Issues
// ─────────────────────────────────────────────────────────────────────────────

async function fetchRepoIssues(token: string, fullName: string): Promise<IssueDetail[]> {
  // GitHub issues endpoint returns both issues and PRs — filter PRs out
  const data = await ghFetch(
    token,
    `/repos/${fullName}/issues?state=open&sort=updated&per_page=${PER_PAGE_ISSUES}`,
  ) as any[] | null;
  if (!data) return [];

  return data
    .filter(issue => !issue.pull_request) // exclude PRs
    .map(issue => ({
      repo: fullName.split('/')[1] ?? fullName,
      number: issue.number,
      title: sanitizeExternalText(issue.title, 200),
      state: issue.state,
      author: issue.user?.login ?? 'unknown',
      labels: (issue.labels ?? []).map((l: any) => l.name),
      createdAt: (issue.created_at ?? '').slice(0, 10),
      updatedAt: (issue.updated_at ?? '').slice(0, 10),
      bodySnippet: sanitizeExternalText(issue.body, BODY_MAX_CHARS),
      url: issue.html_url ?? '',
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Commits
// ─────────────────────────────────────────────────────────────────────────────

async function fetchRepoCommits(token: string, fullName: string): Promise<CommitSummary[]> {
  const data = await ghFetch(
    token,
    `/repos/${fullName}/commits?per_page=${PER_PAGE_COMMITS}`,
  ) as any[] | null;
  if (!data) return [];

  return data.map(c => ({
    repo: fullName.split('/')[1] ?? fullName,
    sha: (c.sha ?? '').slice(0, 7),
    message: sanitizeExternalText(c.commit?.message?.split('\n')[0], 150), // first line only
    author: c.commit?.author?.name ?? c.author?.login ?? 'unknown',
    date: (c.commit?.author?.date ?? '').slice(0, 10),
    url: c.html_url ?? '',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Context assembly — builds the full GitHub context string
// ─────────────────────────────────────────────────────────────────────────────

export async function buildGitHubContext(
  creds: GitHubCreds,
  intent: DetectedIntent,
): Promise<string> {
  // Demo mode: return rich pre-built context instead of making real API calls
  if (creds.token === 'DEMO_MODE') {
    return buildDemoGitHubContext(intent);
  }

  const parts: string[] = [];

  // ── 1. Repo inventory (always) ──
  const repos = await fetchAllRepos(creds);
  if (repos.length > 0) {
    const repoLines = repos.map(r => {
      const topics = r.topics.length > 0 ? ` [${r.topics.join(', ')}]` : '';
      return `  ${r.fullName} | ${r.language} | ★${r.stars} | ${r.openIssues} open issues | updated ${r.updatedAt}${topics}\n    ${r.description || '(no description)'}`;
    });
    parts.push(`<github_repos>\n${repoLines.join('\n\n')}\n</github_repos>`);
  }

  // ── 2. Determine which repos to deep-crawl ──
  const deepRepos: RepoSummary[] = [];

  if (intent.repoHint) {
    // A specific repo was mentioned — deep-crawl it first
    const matched = repos.filter(r =>
      r.name.toLowerCase().includes(intent.repoHint!.toLowerCase()) ||
      r.fullName.toLowerCase().includes(intent.repoHint!.toLowerCase()),
    ).slice(0, 2);
    deepRepos.push(...matched);
  }

  // Also deep-crawl the most recently updated repos (for context richness)
  const remaining = repos
    .filter(r => !deepRepos.some(d => d.fullName === r.fullName))
    .slice(0, MAX_DEEP_REPOS - deepRepos.length);
  deepRepos.push(...remaining);

  // ── 3. PRs ──
  if (intent.needsGitHub || intent.wantsPRReview) {
    let prs: PRDetail[] = [];

    if (intent.repoHint && deepRepos.length > 0) {
      // Deep: per-repo PRs (includes additions/deletions)
      const perRepoPRs = await Promise.allSettled(
        deepRepos.map(r => fetchRepoPRs(creds.token, r.fullName, 'open')),
      );
      perRepoPRs.forEach(r => { if (r.status === 'fulfilled') prs.push(...r.value); });
    } else {
      // Wide: search across all repos
      prs = await fetchOrgWidePRs(creds, PER_PAGE_PRS);
    }

    if (prs.length > 0) {
      const lines = prs.map(pr => {
        const reviewers = pr.reviewers.length > 0 ? ` | reviewers: ${pr.reviewers.map(r => '@' + r).join(', ')}` : '';
        const diff = pr.additions + pr.deletions > 0 ? ` | +${pr.additions}/-${pr.deletions}` : '';
        const labels = pr.labels.length > 0 ? ` | [${pr.labels.join(', ')}]` : '';
        return `  [PR] ${pr.repo}#${pr.number}: "${pr.title}"\n  state=${pr.state} | author=@${pr.author} | updated=${pr.updatedAt}${reviewers}${diff}${labels}${pr.bodySnippet ? '\n  summary: ' + pr.bodySnippet : ''}`;
      });
      parts.push(`<github_prs>\n${lines.join('\n\n')}\n</github_prs>`);
    }
  }

  // ── 4. Issues ──
  if (intent.keywords.some(k => ['bug', 'issue', 'error', 'fix', 'problem'].includes(k))) {
    const issueResults = await Promise.allSettled(
      deepRepos.map(r => fetchRepoIssues(creds.token, r.fullName)),
    );
    const issues: IssueDetail[] = [];
    issueResults.forEach(r => { if (r.status === 'fulfilled') issues.push(...r.value); });

    if (issues.length > 0) {
      const lines = issues.map(i => {
        const labels = i.labels.length > 0 ? ` | [${i.labels.join(', ')}]` : '';
        return `  [ISSUE] ${i.repo}#${i.number}: "${i.title}"\n  state=${i.state} | author=@${i.author} | updated=${i.updatedAt}${labels}${i.bodySnippet ? '\n  summary: ' + i.bodySnippet : ''}`;
      });
      parts.push(`<github_issues>\n${lines.join('\n\n')}\n</github_issues>`);
    }
  }

  // ── 5. Commits ──
  if (intent.wantsCommits || intent.keywords.some(k => ['commit', 'push', 'recent', 'changes', 'history'].includes(k))) {
    const commitResults = await Promise.allSettled(
      deepRepos.map(r => fetchRepoCommits(creds.token, r.fullName)),
    );
    const commits: CommitSummary[] = [];
    commitResults.forEach(r => { if (r.status === 'fulfilled') commits.push(...r.value); });

    if (commits.length > 0) {
      const lines = commits.map(c =>
        `  [${c.repo}] ${c.sha} ${c.date}: "${c.message}" — ${c.author}`,
      );
      parts.push(`<github_commits>\n${lines.join('\n')}\n</github_commits>`);
    }
  }

  // ── 6. README snippets for deep repos ──
  if (intent.repoHint || intent.keywords.some(k => ['readme', 'about', 'what', 'purpose', 'does'].includes(k))) {
    const readmeResults = await Promise.allSettled(
      deepRepos.slice(0, 3).map(async r => {
        const snippet = await fetchReadmeSnippet(creds.token, r.fullName);
        return snippet ? `  [${r.name} README]\n  ${snippet}` : null;
      }),
    );
    const readmes = readmeResults
      .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(Boolean) as string[];

    if (readmes.length > 0) {
      parts.push(`<github_readmes>\n${readmes.join('\n\n')}\n</github_readmes>`);
    }
  }

  return parts.join('\n\n');
}
