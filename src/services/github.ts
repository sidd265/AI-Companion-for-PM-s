/**
 * GitHub data service layer.
 * Calls real GitHub API via stored OAuth token.
 */

import { getGitHubToken } from '@/services/integrations';
import { fetchGitHubRepos, fetchAllPRs } from '@/lib/github';
import type { GitHubPR, Repository } from '@/data/mockData';

export interface PRFilters {
  status?: 'all' | 'Open' | 'Merged' | 'Closed';
  repo?: string;
  author?: string;
  search?: string;
}

let _repoCache: Repository[] | null = null;

export async function fetchRepositories(): Promise<Repository[]> {
  const token = await getGitHubToken();
  if (!token) return [];
  const repos = await fetchGitHubRepos(token);
  _repoCache = repos;
  return repos;
}

export async function fetchPullRequests(filters?: PRFilters): Promise<GitHubPR[]> {
  const token = await getGitHubToken();
  if (!token) return [];

  const repos = _repoCache ?? await fetchRepositories();
  if (repos.length === 0) return [];

  return fetchAllPRs(token, repos, filters);
}

export function getPRUrl(pr: GitHubPR): string {
  return `https://github.com/${pr.repo}/pull/${pr.number}`;
}
