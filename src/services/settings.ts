/**
 * Settings / user profile data service layer.
 *
 * Reads and writes profile data from Supabase.
 * Falls back to mock data when Supabase is not configured.
 */

import { supabase } from '@/lib/supabase';
import { currentUser } from '@/data/mockData';

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  timezone: string;
  avatarColor: string;
}

function toInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Fetch current user profile from Supabase.
 * Falls back to mock data if no authenticated user.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return currentUser;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return currentUser;

  return {
    id: data.id,
    name: data.name,
    initials: toInitials(data.name),
    role: data.role,
    email: data.email,
    timezone: data.timezone,
    avatarColor: data.avatar_color,
  };
}

/**
 * Update user profile in Supabase.
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.role !== undefined && { role: updates.role }),
      ...(updates.timezone !== undefined && { timezone: updates.timezone }),
      ...(updates.avatarColor !== undefined && { avatar_color: updates.avatarColor }),
    })
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
