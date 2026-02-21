/**
 * Dashboard data service layer.
 *
 * Currently returns mock data.
 *
 * When backend is added, replace the function bodies with real API calls.
 * TODO: Replace with edge function calls to aggregate data from Jira + GitHub APIs.
 */

import {
  dashboardStats,
  recentActivity,
  teamMembers,
  jiraTickets,
  pullRequests,
  repositories,
  currentUser,
  type Activity,
  type TeamMember,
  type GitHubPR,
  type Repository,
} from '@/data/mockData';

export interface DashboardStats {
  activeTickets: { count: number; trend: number; completedThisSprint: number; totalThisSprint: number };
  openPRs: { count: number; trend: number; reviewers: { id: string; initials: string; avatarColor: string }[] };
  teamCapacity: { average: number; available: number; trend: number };
  needsAttention: { pendingReviews: number; unassignedTickets: number; blockedTasks: number };
}

export interface TicketsByStatus {
  [status: string]: number;
}

export interface TicketsByPriority {
  [priority: string]: number;
}

export interface TeamWorkloadMember extends TeamMember {
  workloadPercent: number;
}

/**
 * Fetch dashboard stat cards data.
 * TODO: Replace with aggregation API call
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  return dashboardStats;
}

/**
 * Fetch recent activity feed.
 * TODO: Replace with edge function call → aggregate GitHub + Jira activity
 */
export async function fetchRecentActivity(): Promise<Activity[]> {
  return recentActivity;
}

/**
 * Fetch ticket counts grouped by status.
 * TODO: Replace with Jira API aggregation
 */
export async function fetchTicketsByStatus(): Promise<TicketsByStatus> {
  return {
    'To Do': jiraTickets.filter(t => t.status === 'To Do').length,
    'In Progress': jiraTickets.filter(t => t.status === 'In Progress').length,
    'In Review': jiraTickets.filter(t => t.status === 'In Review').length,
    'Done': jiraTickets.filter(t => t.status === 'Done').length,
    'Blocked': jiraTickets.filter(t => t.status === 'Blocked').length,
  };
}

/**
 * Fetch ticket counts grouped by priority.
 * TODO: Replace with Jira API aggregation
 */
export async function fetchTicketsByPriority(): Promise<TicketsByPriority> {
  return {
    'Critical': jiraTickets.filter(t => t.priority === 'Critical').length,
    'High': jiraTickets.filter(t => t.priority === 'High').length,
    'Medium': jiraTickets.filter(t => t.priority === 'Medium').length,
    'Low': jiraTickets.filter(t => t.priority === 'Low').length,
  };
}

/**
 * Fetch team members with workload percentages.
 * TODO: Replace with team/capacity API call
 */
export async function fetchTeamWorkload(): Promise<TeamWorkloadMember[]> {
  return teamMembers
    .map(member => ({
      ...member,
      workloadPercent: Math.round(member.capacity * 100),
    }))
    .sort((a, b) => b.workloadPercent - a.workloadPercent);
}

/**
 * Fetch repository summaries for the dashboard.
 * TODO: Replace with GitHub API call → /repos
 */
export async function fetchRepositorySummaries(): Promise<Repository[]> {
  return repositories;
}

/**
 * Fetch open pull requests for dashboard preview.
 * TODO: Replace with GitHub API call
 */
export async function fetchOpenPullRequests(): Promise<GitHubPR[]> {
  return pullRequests;
}

/**
 * Fetch the total ticket count.
 * TODO: Replace with Jira API call
 */
export async function fetchTotalTicketCount(): Promise<number> {
  return jiraTickets.length;
}

/**
 * Fetch current user profile.
 * TODO: Replace with auth/user API call
 */
export async function fetchCurrentUser() {
  return currentUser;
}
