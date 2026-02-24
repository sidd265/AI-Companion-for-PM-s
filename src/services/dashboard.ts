/**
 * Dashboard data service layer.
 * Aggregates from Supabase tables + real GitHub API.
 */

import { supabase } from '@/lib/supabase';
import { fetchUserProfile } from '@/services/settings';
import { fetchPullRequests, fetchRepositories } from '@/services/github';
import type { Activity, TeamMember, GitHubPR, Repository } from '@/data/mockData';

export interface DashboardStats {
  activeTickets: { count: number; trend: number; completedThisSprint: number; totalThisSprint: number };
  openPRs: { count: number; trend: number; reviewers: { id: string; initials: string; avatarColor: string }[] };
  teamCapacity: { average: number; available: number; trend: number };
  needsAttention: { pendingReviews: number; unassignedTickets: number; blockedTasks: number };
}

export interface TicketsByStatus { [status: string]: number }
export interface TicketsByPriority { [priority: string]: number }
export interface TeamWorkloadMember extends TeamMember { workloadPercent: number }

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data: tickets } = await supabase.from('tickets').select('status, assignee_id');
  const ticketRows = (tickets ?? []) as { status: string; assignee_id: string | null }[];

  const activeCount = ticketRows.filter(t => t.status !== 'Done').length;
  const doneCount = ticketRows.filter(t => t.status === 'Done').length;
  const blockedCount = ticketRows.filter(t => t.status === 'Blocked').length;
  const unassignedCount = ticketRows.filter(t => !t.assignee_id && t.status !== 'Done').length;

  const { data: teamRows } = await supabase.from('team_members').select('capacity');
  const capacities = (teamRows ?? []) as { capacity: number }[];
  const avgCapacity = capacities.length > 0
    ? Math.round(capacities.reduce((s, r) => s + r.capacity, 0) / capacities.length) : 0;
  const available = capacities.filter(r => r.capacity >= 70).length;

  // Real PR count from GitHub
  let openPRCount = 0;
  const reviewers: { id: string; initials: string; avatarColor: string }[] = [];
  try {
    const prs = await fetchPullRequests({ status: 'Open' });
    openPRCount = prs.length;
    const seen = new Set<string>();
    for (const pr of prs) {
      for (const r of pr.reviewers) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          reviewers.push({ id: r.id, initials: r.initials, avatarColor: r.avatarColor });
        }
      }
    }
  } catch { /* GitHub not connected */ }

  return {
    activeTickets: { count: activeCount, trend: 0, completedThisSprint: doneCount, totalThisSprint: ticketRows.length },
    openPRs: { count: openPRCount, trend: 0, reviewers },
    teamCapacity: { average: avgCapacity, available, trend: 0 },
    needsAttention: { pendingReviews: 0, unassignedTickets: unassignedCount, blockedTasks: blockedCount },
  };
}

export async function fetchRecentActivity(): Promise<Activity[]> {
  return []; // Real activity requires webhook infrastructure (future)
}

export async function fetchTicketsByStatus(): Promise<TicketsByStatus> {
  const { data, error } = await supabase.from('tickets').select('status');
  if (error || !data) return { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0, 'Blocked': 0 };
  const rows = data as { status: string }[];
  const counts: TicketsByStatus = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0, 'Blocked': 0 };
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

export async function fetchTicketsByPriority(): Promise<TicketsByPriority> {
  const { data, error } = await supabase.from('tickets').select('priority');
  if (error || !data) return { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const rows = data as { priority: string }[];
  const counts: TicketsByPriority = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const row of rows) counts[row.priority] = (counts[row.priority] ?? 0) + 1;
  return counts;
}

export async function fetchTeamWorkload(): Promise<TeamWorkloadMember[]> {
  const { data, error } = await supabase.from('team_members').select('*');
  if (error || !data || data.length === 0) return [];

  interface TMRow { id: string; name: string; role: string; email: string; github: string | null; slack: string | null; expertise: string[]; avatar_color: string; velocity: number; capacity: number; active_tasks: number }
  const rows = data as TMRow[];

  return rows
    .map(r => ({
      id: r.id, name: r.name,
      initials: r.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2),
      role: r.role, email: r.email, github: r.github ?? '', slack: r.slack ?? '',
      expertise: r.expertise, capacity: r.capacity / 100,
      currentTasks: [] as TeamMember['currentTasks'],
      recentActivity: { commits: 0, reviews: 0, prsOpened: 0 },
      avatarColor: r.avatar_color, workloadPercent: r.capacity,
    }))
    .sort((a, b) => b.workloadPercent - a.workloadPercent);
}

export async function fetchRepositorySummaries(): Promise<Repository[]> {
  return fetchRepositories();
}

export async function fetchOpenPullRequests(): Promise<GitHubPR[]> {
  return fetchPullRequests({ status: 'Open' });
}

export async function fetchTotalTicketCount(): Promise<number> {
  const { count, error } = await supabase.from('tickets').select('*', { count: 'exact', head: true });
  if (error || count === null) return 0;
  return count;
}

export async function fetchCurrentUser() {
  return fetchUserProfile();
}
