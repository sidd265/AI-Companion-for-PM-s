/**
 * Team data service layer.
 *
 * Currently returns mock data.
 * TODO: Replace with backend API calls when Cloud is enabled.
 */

import { teamMembers, type TeamMember } from '@/data/mockData';

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

/**
 * Fetch team members with optional filters.
 * TODO: Replace with edge function call → team API
 */
export async function fetchTeamMembers(filters?: TeamFilters): Promise<TeamMember[]> {
  let members = [...teamMembers];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    members = members.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q),
    );
  }

  if (filters?.expertise && filters.expertise.length > 0) {
    members = members.filter(m =>
      filters.expertise!.some(skill => m.expertise.includes(skill)),
    );
  }

  return members;
}

/**
 * Fetch aggregate team stats.
 * TODO: Replace with analytics API call
 */
export async function fetchTeamStats(): Promise<TeamStats> {
  return {
    totalMembers: teamMembers.length,
    averageVelocity: 42,
    activeTasks: 24,
    expertiseCoverage: 94,
  };
}

/**
 * Get all unique expertise tags from team members.
 * TODO: Replace with API call
 */
export async function fetchAllExpertise(): Promise<string[]> {
  return Array.from(new Set(teamMembers.flatMap(m => m.expertise))).sort();
}

/**
 * Add a new team member.
 * TODO: Replace with edge function call → team API POST
 */
export async function addTeamMember(member: {
  name: string;
  email: string;
  role: string;
  github?: string;
  slack?: string;
  expertise?: string[];
}): Promise<{ success: boolean }> {
  // Placeholder — currently just returns success
  console.log('addTeamMember called with:', member);
  return { success: true };
}
