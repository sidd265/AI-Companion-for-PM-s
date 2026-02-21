/**
 * Settings / user profile data service layer.
 *
 * Currently returns mock data.
 * TODO: Replace with backend API calls when Cloud is enabled.
 */

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

/**
 * Fetch current user profile.
 * TODO: Replace with auth/user API call
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  return currentUser;
}

/**
 * Update user profile.
 * TODO: Replace with edge function call → user API PUT
 */
export async function updateUserProfile(data: Partial<UserProfile>): Promise<{ success: boolean }> {
  console.log('updateUserProfile called with:', data);
  return { success: true };
}

/**
 * Update notification preferences.
 * TODO: Replace with edge function call → preferences API PUT
 */
export async function updateNotificationPreferences(prefs: {
  email?: boolean;
  slack?: boolean;
  desktop?: boolean;
  events?: Record<string, boolean>;
}): Promise<{ success: boolean }> {
  console.log('updateNotificationPreferences called with:', prefs);
  return { success: true };
}

/**
 * Export all user data.
 * TODO: Replace with edge function call → data export API
 */
export async function exportUserData(): Promise<{ success: boolean; downloadUrl?: string }> {
  console.log('exportUserData called');
  return { success: true };
}

/**
 * Delete the user account.
 * TODO: Replace with edge function call → account deletion API
 */
export async function deleteAccount(): Promise<{ success: boolean }> {
  console.log('deleteAccount called');
  return { success: true };
}
