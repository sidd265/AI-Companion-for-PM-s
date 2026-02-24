/**
 * Team data service layer.
 * Queries Supabase team_members table.
 */

import { supabase } from '@/lib/supabase';
import type { TeamMember } from '@/data/mockData';

export interface TeamFilters {
  search?: string;
  expertise?: string[];
}

export interface TeamStats {
  totalMembers: number;
  averageVelocity: number;
  activeTasks: number;
  expertiseCoverage: number;
}

interface TeamMemberRow {
  id: string;
  name: string;
  role: string;
  email: string;
  github: string | null;
  slack: string | null;
  expertise: string[];
  avatar_color: string;
  velocity: number;
  capacity: number;
  active_tasks: number;
}

function toInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function rowToTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    initials: toInitials(row.name),
    role: row.role,
    email: row.email,
    github: row.github ?? '',
    slack: row.slack ?? '',
    expertise: row.expertise,
    capacity: row.capacity / 100,
    currentTasks: [],
    recentActivity: { commits: 0, reviews: 0, prsOpened: 0 },
    avatarColor: row.avatar_color,
  };
}

/**
 * Fetch team members with optional filters.
 */
export async function fetchTeamMembers(filters?: TeamFilters): Promise<TeamMember[]> {
  let query = supabase.from('team_members').select('*');

  if (filters?.search) {
    const q = `%${filters.search}%`;
    query = query.or(`name.ilike.${q},role.ilike.${q}`);
  }

  if (filters?.expertise && filters.expertise.length > 0) {
    query = query.overlaps('expertise', filters.expertise);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as TeamMemberRow[]).map(rowToTeamMember);
}

/**
 * Fetch aggregate team stats.
 */
export async function fetchTeamStats(): Promise<TeamStats> {
  const { data, error } = await supabase.from('team_members').select('velocity, active_tasks, expertise');
  if (error || !data || data.length === 0) {
    return { totalMembers: 0, averageVelocity: 0, activeTasks: 0, expertiseCoverage: 0 };
  }

  const rows = data as { velocity: number; active_tasks: number; expertise: string[] }[];
  const allExpertise = new Set(rows.flatMap(r => r.expertise));

  return {
    totalMembers: rows.length,
    averageVelocity: Math.round(rows.reduce((s, r) => s + r.velocity, 0) / rows.length),
    activeTasks: rows.reduce((s, r) => s + r.active_tasks, 0),
    expertiseCoverage: allExpertise.size,
  };
}

/**
 * Get all unique expertise tags from team members.
 */
export async function fetchAllExpertise(): Promise<string[]> {
  const { data, error } = await supabase.from('team_members').select('expertise');
  if (error || !data) return [];

  const rows = data as { expertise: string[] }[];
  return Array.from(new Set(rows.flatMap(r => r.expertise))).sort();
}

/**
 * Add a new team member.
 */
export async function addTeamMember(member: {
  name: string;
  email: string;
  role: string;
  github?: string;
  slack?: string;
  expertise?: string[];
}): Promise<{ success: boolean }> {
  const { error } = await supabase.from('team_members').insert({
    name: member.name,
    email: member.email,
    role: member.role,
    github: member.github ?? null,
    slack: member.slack ?? null,
    expertise: member.expertise ?? [],
    avatar_color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
  });

  return { success: !error };
}
