/**
 * Settings / user profile data service layer.
 *
 * Reads and writes profile data from Supabase.
 * Falls back to mock data when no authenticated user exists.
 */

import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  timezone: string;
  avatarColor: string;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  timezone: string;
  avatar_color: string;
}

function toInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    initials: toInitials(row.name),
    role: row.role,
    email: row.email,
    timezone: row.timezone,
    avatarColor: row.avatar_color,
  };
}

/**
 * Fetch current user profile from Supabase.
 * Falls back to mock data if no authenticated user.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const DEFAULT_PROFILE: UserProfile = {
    id: '', name: 'Guest', initials: 'G', role: 'Member',
    email: '', timezone: 'UTC', avatarColor: '#888888',
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_PROFILE;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, timezone, avatar_color')
    .eq('id', user.id)
    .single();

  if (error || !data) return DEFAULT_PROFILE;

  return rowToProfile(data as ProfileRow);
}

/**
 * Update user profile in Supabase.
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const payload: Record<string, string> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.timezone !== undefined) payload.timezone = updates.timezone;
  if (updates.avatarColor !== undefined) payload.avatar_color = updates.avatarColor;

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id);

  return { success: !error };
}

/**
 * Update notification preferences.
 * TODO: Add notification_preferences column or table in Step 6 (Slack).
 */
export async function updateNotificationPreferences(prefs: {
  email?: boolean;
  slack?: boolean;
  desktop?: boolean;
  events?: Record<string, boolean>;
}): Promise<{ success: boolean }> {
  void prefs;
  return { success: true };
}

/**
 * Export all user data.
 * TODO: Implement via Edge Function.
 */
export async function exportUserData(): Promise<{ success: boolean; downloadUrl?: string }> {
  return { success: true };
}

/**
 * Delete the user account.
 * TODO: Implement via Edge Function (needs service_role key).
 */
export async function deleteAccount(): Promise<{ success: boolean }> {
  return { success: true };
}
