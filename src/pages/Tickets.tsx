import { useState, useEffect, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchTickets, getUniqueProjects, type TicketFilters } from '@/services/tickets';
import type { JiraTicket } from '@/data/mockData';
import { TicketSummaryCards } from '@/components/tickets/TicketSummaryCards';
import { TicketCard } from '@/components/tickets/TicketCard';

const Tickets = () => {
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [allTickets, setAllTickets] = useState<JiraTicket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [search, setSearch] = useState('');
  const projects = useMemo(() => getUniqueProjects(), []);

  useEffect(() => {
    fetchTickets().then(setAllTickets);
  }, []);

  useEffect(() => {
    fetchTickets({ ...filters, search }).then(setTickets);
  }, [filters, search]);

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage tickets across all projects
        </p>
      </div>

      {/* Summary cards */}
      <TicketSummaryCards tickets={allTickets} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by title, key, or project…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v as TicketFilters['status'] }))}
        >
          <SelectTrigger className="w-[150px]">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, priority: v as TicketFilters['priority'] }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.project || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, project: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {tickets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No tickets match the current filters.
          </div>
        )}
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};

export default Tickets;
