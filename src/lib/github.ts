/**
 * GitHub REST API helper.
 * Makes authenticated requests using the user's OAuth token.
 */

import type { GitHubPR, Repository, TeamMember, JiraTicket } from '@/data/mockData';
import type { PRActivityPoint } from '@/services/chartData';

const GITHUB_API = 'https://api.github.com';

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

export class GitHubApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 401) throw new GitHubApiError(401, 'GitHub token expired or invalid');
  if (res.status === 403) throw new GitHubApiError(403, 'GitHub API rate limit exceeded');
  if (!res.ok) throw new GitHubApiError(res.status, `GitHub API error: ${res.status}`);

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#E255A1', '#2383E2', '#0F7B6C', '#D9730D', '#9065B0', '#DFAB01', '#FF5A5F', '#448AFF'];
  return colors[Math.abs(hash) % colors.length];
}

function loginToTeamMember(login: string): TeamMember {
  return {
    id: login,
    name: login,
    initials: login.slice(0, 2).toUpperCase(),
    role: '',
    email: '',
    github: `@${login}`,
    slack: '',
    expertise: [],
    capacity: 0,
    currentTasks: [] as JiraTicket[],
    recentActivity: { commits: 0, reviews: 0, prsOpened: 0 },
    avatarColor: hashColor(login),
  };
}

// ---------------------------------------------------------------------------
// GitHub API response types (subset of fields we use)
// ---------------------------------------------------------------------------

interface GHRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
  open_issues_count: number;
  fork: boolean;
}

interface GHPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  merged_at: string | null;
  user: { login: string };
  requested_reviewers: { login: string }[];
  created_at: string;
  updated_at: string;
  additions?: number;
  deletions?: number;
  html_url: string;
}

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------

export async function fetchGitHubRepos(token: string): Promise<Repository[]> {
  const repos = await githubFetch<GHRepo[]>(
    '/user/repos?sort=updated&per_page=100&type=all',
    token,
  );

  return repos
    .filter(r => !r.fork)
    .map(r => ({
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? '',
      language: r.language ?? 'Unknown',
      languages: r.language ? [r.language] : [],
      stars: r.stargazers_count,
      contributors: 0,
      lastUpdated: timeAgo(r.updated_at),
      openPRs: r.open_issues_count, // GitHub combines issues+PRs in this count
      url: r.html_url,
    }));
}

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

export async function fetchGitHubPRs(
  token: string,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
): Promise<GitHubPR[]> {
  const prs = await githubFetch<GHPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=50&sort=updated&direction=desc`,
    token,
  );

  // Fetch individual PR details in parallel to get additions/deletions
  // (list endpoint doesn't include them)
  const detailed = await Promise.all(
    prs.map(pr =>
      githubFetch<GHPullRequest>(
        `/repos/${owner}/${repo}/pulls/${pr.number}`,
        token,
      ).catch(() => pr),
    ),
  );

  return detailed.map(pr => ({
    id: String(pr.id),
    number: pr.number,
    title: pr.title,
    repo: `${owner}/${repo}`,
    author: loginToTeamMember(pr.user.login),
    reviewers: pr.requested_reviewers.map(r => loginToTeamMember(r.login)),
    status: pr.merged_at ? 'Merged' as const : pr.state === 'open' ? 'Open' as const : 'Closed' as const,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    additions: pr.additions ?? 0,
    deletions: pr.deletions ?? 0,
  }));
}

/**
 * Fetch PRs across multiple repos, with optional filters.
 */
export async function fetchAllPRs(
  token: string,
  repos: Repository[],
  filters?: { status?: string; repo?: string; author?: string; search?: string },
): Promise<GitHubPR[]> {
  const targetRepos = filters?.repo
    ? repos.filter(r => r.name === filters.repo || r.fullName === filters.repo)
    : repos.slice(0, 10); // Limit to 10 repos to avoid rate limits

  const ghState = filters?.status === 'Open' ? 'open' : filters?.status === 'Closed' || filters?.status === 'Merged' ? 'closed' : 'all';

  const results = await Promise.all(
    targetRepos.map(r => {
      const [owner, name] = r.fullName.split('/');
      return fetchGitHubPRs(token, owner, name, ghState).catch(() => [] as GitHubPR[]);
    }),
  );

  let prs = results.flat();

  // Client-side filtering for Merged (GitHub API returns closed for both merged+closed)
  if (filters?.status === 'Merged') {
    prs = prs.filter(p => p.status === 'Merged');
  } else if (filters?.status === 'Closed') {
    prs = prs.filter(p => p.status === 'Closed');
  }

  if (filters?.author) {
    prs = prs.filter(p => p.author.id === filters.author);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    prs = prs.filter(p =>
      p.title.toLowerCase().includes(q) ||
      `#${p.number}`.includes(q) ||
      p.repo.toLowerCase().includes(q),
    );
  }

  return prs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// ---------------------------------------------------------------------------
// Commits (count only)
// ---------------------------------------------------------------------------

export async function fetchGitHubCommitCount(
  token: string,
  owner: string,
  repo: string,
  since: string,
): Promise<number> {
  // Use per_page=1 and check the Link header for total count to save bandwidth
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/commits?since=${since}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    },
  );

  if (!res.ok) return 0;

  // Parse Link header for last page number
  const link = res.headers.get('Link') ?? '';
  const match = link.match(/page=(\d+)>; rel="last"/);
  if (match) return parseInt(match[1], 10);

  // If no Link header, count is <= per_page
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Count total commits today across multiple repos.
 */
export async function fetchCommitsToday(token: string, repos: Repository[]): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = today.toISOString();

  const counts = await Promise.all(
    repos.slice(0, 10).map(r => {
      const [owner, name] = r.fullName.split('/');
      return fetchGitHubCommitCount(token, owner, name, since).catch(() => 0);
    }),
  );

  return counts.reduce((sum, c) => sum + c, 0);
}

// ---------------------------------------------------------------------------
// PR Activity (for charts)
// ---------------------------------------------------------------------------

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function fetchGitHubPRActivity(
  token: string,
  owner: string,
  repo: string,
): Promise<PRActivityPoint[]> {
  const prs = await githubFetch<GHPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=all&per_page=100&sort=created&direction=desc`,
    token,
  );

  // Bucket by day of week
  const buckets: Record<string, { opened: number; merged: number }> = {};
  for (const day of DAYS) {
    buckets[day] = { opened: 0, merged: 0 };
  }

  for (const pr of prs) {
    const createdDay = DAYS[new Date(pr.created_at).getDay()];
    buckets[createdDay].opened++;

    if (pr.merged_at) {
      const mergedDay = DAYS[new Date(pr.merged_at).getDay()];
      buckets[mergedDay].merged++;
    }
  }

  // Return Mon-Sun order
  const ordered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return ordered.map(day => ({ day, ...buckets[day] }));
}

/**
 * Fetch PR activity across all repos or a specific one.
 */
export async function fetchAllPRActivity(
  token: string,
  repos: Repository[],
  repoFilter: string = 'all',
): Promise<PRActivityPoint[]> {
  const targetRepos = repoFilter === 'all'
    ? repos.slice(0, 5)
    : repos.filter(r => r.name === repoFilter);

  if (targetRepos.length === 0) return [];

  const results = await Promise.all(
    targetRepos.map(r => {
      const [owner, name] = r.fullName.split('/');
      return fetchGitHubPRActivity(token, owner, name).catch(() => [] as PRActivityPoint[]);
    }),
  );

  // Merge activity across repos
  const merged: Record<string, { opened: number; merged: number }> = {};
  const ordered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (const day of ordered) {
    merged[day] = { opened: 0, merged: 0 };
  }

  for (const activity of results) {
    for (const point of activity) {
      if (merged[point.day]) {
        merged[point.day].opened += point.opened;
        merged[point.day].merged += point.merged;
      }
    }
  }

  return ordered.map(day => ({ day, ...merged[day] }));
}
