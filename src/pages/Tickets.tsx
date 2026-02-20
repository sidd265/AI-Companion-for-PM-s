import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, List, LayoutGrid, X } from 'lucide-react';
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
import { TicketStatusFilter } from '@/components/tickets/TicketStatusFilter';
import { TicketCard } from '@/components/tickets/TicketCard';
import { KanbanBoard } from '@/components/tickets/KanbanBoard';

type ViewMode = 'list' | 'board';

const Tickets = () => {
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [allTickets, setAllTickets] = useState<JiraTicket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const projects = useMemo(() => getUniqueProjects(), []);

  useEffect(() => {
    fetchTickets().then(setAllTickets);
  }, []);

  useEffect(() => {
    fetchTickets({ ...filters, search }).then(setTickets);
  }, [filters, search]);

  const hasActiveFilters =
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    filters.project ||
    search;

  const clearFilters = () => {
    setFilters({});
    setSearch('');
  };

  return (
    <div className={`px-4 py-4 md:px-8 md:py-6 space-y-5 ${viewMode === 'list' ? 'max-w-[1200px]' : ''}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Tickets</h1>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Synced
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'board'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
          </div>
          <a
            href="https://company.atlassian.net"
            target="_blank"
            rel="noopener noreferrer"
            className="airbnb-btn-secondary flex items-center gap-2 !px-3 !py-1.5 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Jira
          </a>
        </div>
      </div>

      {/* Status pills */}
      <TicketStatusFilter
        tickets={allTickets}
        activeStatus={filters.status}
        onStatusChange={(status) =>
          setFilters((f) => ({ ...f, status: status as TicketFilters['status'] }))
        }
      />

      {/* Inline filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder={`Search ${allTickets.length} tickets…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-border/50 bg-muted/30 focus:bg-card"
          />
        </div>
        <Select
          value={filters.priority || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, priority: v as TicketFilters['priority'] }))}
        >
          <SelectTrigger className="w-full sm:w-[130px] h-9 border-border/50 bg-muted/30">
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
          <SelectTrigger className="w-full sm:w-[160px] h-9 border-border/50 bg-muted/30">
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
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'board' ? (
        <KanbanBoard tickets={tickets} />
      ) : (
        <div className="space-y-2">
          {tickets.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">{hasActiveFilters ? '🔍' : '📋'}</div>
              <p className="text-sm font-medium text-foreground">
                {hasActiveFilters ? 'No tickets match your filters' : 'No tickets yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] mx-auto">
                {hasActiveFilters
                  ? 'Try broadening your search or clearing some filters'
                  : 'Connect your Jira workspace to start tracking tickets here'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
