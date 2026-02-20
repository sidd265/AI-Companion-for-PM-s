import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ExternalLink, List, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  const activeFilterCount = [
    filters.status && filters.status !== 'all',
    filters.priority && filters.priority !== 'all',
    filters.project,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({});
    setSearch('');
  };

  return (
    <div className={`px-4 py-4 md:px-8 md:py-6 space-y-6 ${viewMode === 'list' ? 'max-w-[1200px]' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="airbnb-h1">Tickets</h1>
          <p className="airbnb-small mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Synced from Jira
            </span>
            <span className="text-border">·</span>
            <span>{allTickets.length} total tickets</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
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
            className="airbnb-btn-secondary flex items-center gap-2 !px-4 !py-2 text-xs"
          >
            Open Jira
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Summary cards — only in list view */}
      {viewMode === 'list' && <TicketSummaryCards tickets={allTickets} />}

      {/* Filters section */}
      <div className="airbnb-card-static p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {(activeFilterCount > 0 || search) && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, key, or project…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {viewMode === 'list' && (
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters((f) => ({ ...f, status: v as TicketFilters['status'] }))}
            >
              <SelectTrigger className="w-full sm:w-[150px] h-9">
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
          )}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(v) => setFilters((f) => ({ ...f, priority: v as TicketFilters['priority'] }))}
          >
            <SelectTrigger className="w-full sm:w-[140px] h-9">
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
            <SelectTrigger className="w-full sm:w-[180px] h-9">
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
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Showing {tickets.length} of {allTickets.length} tickets
        </span>
      </div>

      {/* Content */}
      {viewMode === 'board' ? (
        <KanbanBoard tickets={tickets} />
      ) : (
        <div className="space-y-2">
          {tickets.length === 0 && (
            <div className="airbnb-card-static text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-medium text-foreground">No tickets found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-xs text-primary hover:text-primary/80 font-medium"
              >
                Clear all filters
              </button>
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
