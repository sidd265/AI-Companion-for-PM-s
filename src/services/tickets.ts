/**
 * Ticket / Jira data service layer.
 *
 * Currently returns mock data.
 *
 * When backend (Lovable Cloud) is added, replace the function bodies
 * with real Jira REST API calls via an edge function. The edge function
 * should call:
 *   GET /rest/api/3/search   — to fetch issues (JQL-based)
 *   GET /rest/api/3/project  — to list projects
 *
 * Jira API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 *
 * Required secrets (to be stored in Cloud):
 *   JIRA_BASE_URL  — e.g. https://yourcompany.atlassian.net
 *   JIRA_EMAIL     — Jira account email
 *   JIRA_API_TOKEN — API token from https://id.atlassian.com/manage-profile/security/api-tokens
 */

import { jiraTickets, type JiraTicket } from '@/data/mockData';

export interface TicketFilters {
  status?: 'all' | JiraTicket['status'];
  priority?: 'all' | JiraTicket['priority'];
  project?: string;
  search?: string;
}

/**
 * Fetch tickets with optional filters.
 * TODO: Replace with edge function call → Jira REST API /rest/api/3/search
 */
export async function fetchTickets(filters?: TicketFilters): Promise<JiraTicket[]> {
  let tickets = [...jiraTickets];

  if (filters?.status && filters.status !== 'all') {
    tickets = tickets.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== 'all') {
    tickets = tickets.filter((t) => t.priority === filters.priority);
  }
  if (filters?.project) {
    tickets = tickets.filter((t) => t.project === filters.project);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    tickets = tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q),
    );
  }

  return tickets;
}

/**
 * Get unique project names.
 * TODO: Replace with edge function call → Jira REST API /rest/api/3/project
 */
export function getUniqueProjects(): string[] {
  return [...new Set(jiraTickets.map((t) => t.project))];
}

/**
 * Build a Jira ticket URL.
 * When backend is added, use the real JIRA_BASE_URL from config/env.
 */
const JIRA_BASE_URL = 'https://company.atlassian.net';

export function getTicketUrl(ticket: JiraTicket): string {
  return `${JIRA_BASE_URL}/browse/${ticket.key}`;
}
