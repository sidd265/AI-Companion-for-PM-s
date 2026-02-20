/**
 * GitHub data service layer.
 * Currently returns mock data. Swap the implementations here
 * when a real backend / GitHub API integration is added.
 */

import { pullRequests, repositories, type GitHubPR, type Repository } from '@/data/mockData';

export interface PRFilters {
  status?: 'all' | 'Open' | 'Merged' | 'Closed';
  repo?: string;
  author?: string;
  search?: string;
}

export async function fetchPullRequests(filters?: PRFilters): Promise<GitHubPR[]> {
  // TODO: Replace with real API call
  let prs = [...pullRequests];

  if (filters?.status && filters.status !== 'all') {
    prs = prs.filter((pr) => pr.status === filters.status);
  }
  if (filters?.repo) {
    prs = prs.filter((pr) => pr.repo === filters.repo);
  }
  if (filters?.author) {
    prs = prs.filter((pr) => pr.author.id === filters.author);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    prs = prs.filter(
      (pr) =>
        pr.title.toLowerCase().includes(q) ||
        `#${pr.number}`.includes(q) ||
        pr.repo.toLowerCase().includes(q),
    );
  }

  return prs;
}

export async function fetchRepositories(): Promise<Repository[]> {
  // TODO: Replace with real API call
  return repositories;
}

/** Build a GitHub-style URL for a PR (mock). Replace with real URLs later. */
export function getPRUrl(pr: GitHubPR): string {
  const repo = repositories.find((r) => r.name === pr.repo);
  if (repo) {
    return `${repo.url}/pull/${pr.number}`;
  }
  return `https://github.com/company/${pr.repo}/pull/${pr.number}`;
}
