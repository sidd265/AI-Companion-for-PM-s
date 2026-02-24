/**
 * Integrations data service layer.
 *
 * Currently returns mock data.
 * TODO: Replace with backend API calls when Cloud is enabled.
 */

import { integrations, repositories, type Repository } from '@/data/mockData';

export interface IntegrationStatus {
  github: {
    connected: boolean;
    username?: string;
    repos?: number;
    lastSync?: string;
  };
  jira: {
    connected: boolean;
    site?: string;
    projects?: number;
    lastSync?: string;
  };
  slack: {
    connected: boolean;
    workspace?: string | null;
    channels?: number;
    lastSync?: string | null;
  };
}

/**
 * Fetch all integration statuses.
 * TODO: Replace with edge function call → integrations API
 */
export async function fetchIntegrationStatuses(): Promise<IntegrationStatus> {
  return integrations;
}

/**
 * Fetch repositories for integration management.
 * TODO: Replace with GitHub API call
 */
export async function fetchIntegrationRepositories(): Promise<Repository[]> {
  return repositories;
}

/**
 * Connect an integration.
 * TODO: Replace with OAuth flow / edge function call
 */
export async function connectIntegration(type: 'github' | 'jira' | 'slack'): Promise<{ success: boolean }> {
  void type;
  return { success: true };
}

/**
 * Disconnect an integration.
 * TODO: Replace with edge function call → integrations API DELETE
 */
export async function disconnectIntegration(type: 'github' | 'jira' | 'slack'): Promise<{ success: boolean }> {
  void type;
  return { success: true };
}

/**
 * Trigger a sync for an integration.
 * TODO: Replace with edge function call → integrations API POST /sync
 */
export async function syncIntegration(type: 'github' | 'jira' | 'slack'): Promise<{ success: boolean }> {
  void type;
  return { success: true };
}
