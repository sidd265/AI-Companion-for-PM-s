/**
 * Ticket data service layer.
 * Currently returns mock data. Swap the implementations here
 * when a real backend / Jira API integration is added.
 */

import { jiraTickets, type JiraTicket } from '@/data/mockData';

export interface TicketFilters {
  status?: 'all' | JiraTicket['status'];
  priority?: 'all' | JiraTicket['priority'];
  project?: string;
  search?: string;
}

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

export function getUniqueProjects(): string[] {
  return [...new Set(jiraTickets.map((t) => t.project))];
}
