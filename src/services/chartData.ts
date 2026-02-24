// Chart data service layer
// PR activity uses real GitHub API. Ticket trends/sprint burndown stay mock until Jira (Step 5).

import { getGitHubToken } from '@/services/integrations';
import { fetchGitHubRepos, fetchAllPRActivity } from '@/lib/github';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketTrendPoint {
  date: string;
  created: number;
  completed: number;
  inProgress: number;
}

export interface SprintBurndownPoint {
  day: string;
  remaining: number | null;
  ideal: number;
  completed: number | null;
}

export interface SprintMeta {
  currentDay: number;
  totalDays: number;
  totalPoints: number;
  completedPoints: number;
}

export interface PRActivityPoint {
  day: string;
  opened: number;
  merged: number;
}

// ─── Mock Data (Jira — migrated in Step 5) ──────────────────────────────────

const mockTicketTrends: TicketTrendPoint[] = [
  { date: 'Jan 20', created: 5, completed: 3, inProgress: 8 },
  { date: 'Jan 21', created: 3, completed: 4, inProgress: 7 },
  { date: 'Jan 22', created: 7, completed: 2, inProgress: 12 },
  { date: 'Jan 23', created: 4, completed: 6, inProgress: 10 },
  { date: 'Jan 24', created: 2, completed: 5, inProgress: 7 },
  { date: 'Jan 25', created: 6, completed: 3, inProgress: 10 },
  { date: 'Jan 26', created: 3, completed: 4, inProgress: 9 },
  { date: 'Jan 27', created: 8, completed: 5, inProgress: 12 },
  { date: 'Jan 28', created: 4, completed: 7, inProgress: 9 },
  { date: 'Jan 29', created: 5, completed: 4, inProgress: 10 },
  { date: 'Jan 30', created: 6, completed: 6, inProgress: 10 },
  { date: 'Jan 31', created: 3, completed: 5, inProgress: 8 },
  { date: 'Feb 1', created: 7, completed: 4, inProgress: 11 },
  { date: 'Feb 2', created: 4, completed: 3, inProgress: 12 },
];

const mockSprintBurndown: SprintBurndownPoint[] = [
  { day: 'Day 1', remaining: 32, ideal: 32, completed: 0 },
  { day: 'Day 2', remaining: 30, ideal: 29.1, completed: 2 },
  { day: 'Day 3', remaining: 27, ideal: 26.2, completed: 5 },
  { day: 'Day 4', remaining: 25, ideal: 23.3, completed: 7 },
  { day: 'Day 5', remaining: 22, ideal: 20.4, completed: 10 },
  { day: 'Day 6', remaining: 20, ideal: 17.5, completed: 12 },
  { day: 'Day 7', remaining: 18, ideal: 14.5, completed: 14 },
  { day: 'Day 8', remaining: 16, ideal: 11.6, completed: 16 },
  { day: 'Day 9', remaining: 14, ideal: 8.7, completed: 18 },
  { day: 'Day 10', remaining: null, ideal: 5.8, completed: null },
  { day: 'Day 11', remaining: null, ideal: 2.9, completed: null },
  { day: 'Day 12', remaining: null, ideal: 0, completed: null },
];

const mockSprintMeta: SprintMeta = {
  currentDay: 9,
  totalDays: 12,
  totalPoints: 32,
  completedPoints: 18,
};

// ─── Service Functions ────────────────────────────────────────────────────────

export async function fetchTicketTrends(): Promise<TicketTrendPoint[]> {
  return mockTicketTrends;
}

export async function fetchSprintBurndown(): Promise<{
  data: SprintBurndownPoint[];
  meta: SprintMeta;
}> {
  return { data: mockSprintBurndown, meta: mockSprintMeta };
}

export async function fetchPRActivity(repo: string = 'all'): Promise<PRActivityPoint[]> {
  const token = await getGitHubToken();
  if (!token) return [];

  try {
    const repos = await fetchGitHubRepos(token);
    return fetchAllPRActivity(token, repos, repo);
  } catch {
    return [];
  }
}
