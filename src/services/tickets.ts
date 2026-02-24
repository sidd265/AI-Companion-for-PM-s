/**
 * Ticket data service layer.
 * Queries Supabase tickets table.
 */

import { supabase } from '@/lib/supabase';
import type { JiraTicket } from '@/data/mockData';

export interface TicketFilters {
  status?: 'all' | JiraTicket['status'];
  priority?: 'all' | JiraTicket['priority'];
  project?: string;
  search?: string;
}

interface TicketWithProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  project_id: string;
  assignee_id: string | null;
  jira_key: string | null;
  story_points: number | null;
  created_at: string;
  updated_at: string;
  projects: { name: string; key: string } | null;
}

function rowToTicket(row: TicketWithProject): JiraTicket {
  return {
    id: row.id,
    key: row.jira_key ?? row.id.slice(0, 8).toUpperCase(),
    title: row.title,
    status: row.status as JiraTicket['status'],
    priority: row.priority as JiraTicket['priority'],
    project: row.projects?.name ?? 'Unknown',
    type: row.type as JiraTicket['type'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch tickets with optional filters.
 */
export async function fetchTickets(filters?: TicketFilters): Promise<JiraTicket[]> {
  let query = supabase.from('tickets').select('*, projects(name, key)');

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.search) {
    const q = `%${filters.search}%`;
    query = query.or(`title.ilike.${q},jira_key.ilike.${q}`);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error || !data) return [];

  let tickets = (data as TicketWithProject[]).map(rowToTicket);

  if (filters?.project) {
    tickets = tickets.filter(t => t.project === filters.project);
  }

  return tickets;
}

/**
 * Get unique project names.
 */
export async function getUniqueProjects(): Promise<string[]> {
  const { data, error } = await supabase.from('projects').select('name');
  if (error || !data) return [];

  return (data as { name: string }[]).map(r => r.name);
}

/**
 * Create a new ticket.
 */
export async function createTicket(ticketData: {
  title: string;
  description?: string;
  priority: JiraTicket['priority'];
  type: JiraTicket['type'];
  project: string;
  assigneeId?: string;
}): Promise<{ success: boolean; key?: string }> {
  const { data: project } = await supabase
    .from('projects')
    .select('id, key')
    .eq('name', ticketData.project)
    .single();

  if (!project) return { success: false };

  const proj = project as { id: string; key: string };
  const { data, error } = await supabase.from('tickets').insert({
    title: ticketData.title,
    description: ticketData.description ?? null,
    priority: ticketData.priority,
    type: ticketData.type,
    project_id: proj.id,
    assignee_id: ticketData.assigneeId ?? null,
    jira_key: `${proj.key}-${Math.floor(1000 + Math.random() * 9000)}`,
  }).select('jira_key').single();

  if (error) return { success: false };
  return { success: true, key: (data as { jira_key: string } | null)?.jira_key ?? undefined };
}

/**
 * Build a Jira ticket URL.
 */
const JIRA_BASE_URL = import.meta.env.VITE_JIRA_BASE_URL || 'https://company.atlassian.net';

export function getTicketUrl(ticket: JiraTicket): string {
  return `${JIRA_BASE_URL}/browse/${ticket.key}`;
}
