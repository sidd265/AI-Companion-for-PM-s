import { Circle, Loader2, Eye, CheckCircle2, AlertOctagon, FileText, Bug, Zap, Layers, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JiraTicket } from '@/data/mockData';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { getTicketUrl } from '@/services/tickets';

const columns: { key: JiraTicket['status']; icon: React.ElementType; color: string; borderColor: string }[] = [
  { key: 'To Do', icon: Circle, color: 'text-muted-foreground', borderColor: 'border-t-muted-foreground/30' },
  { key: 'In Progress', icon: Loader2, color: 'text-blue-500', borderColor: 'border-t-blue-500' },
  { key: 'In Review', icon: Eye, color: 'text-amber-500', borderColor: 'border-t-amber-500' },
  { key: 'Done', icon: CheckCircle2, color: 'text-green-500', borderColor: 'border-t-green-500' },
  { key: 'Blocked', icon: AlertOctagon, color: 'text-destructive', borderColor: 'border-t-destructive' },
];

const typeIcon: Record<JiraTicket['type'], React.ElementType> = {
  Story: FileText,
  Bug: Bug,
  Task: Zap,
  Epic: Layers,
};

const typeColor: Record<JiraTicket['type'], string> = {
  Story: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400',
  Bug: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
  Task: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  Epic: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const KanbanCard = ({ ticket }: { ticket: JiraTicket }) => {
  const Icon = typeIcon[ticket.type];
  return (
    <motion.a
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      href={getTicketUrl(ticket)}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[ticket.type]}`}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {ticket.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
              {ticket.key}
            </span>
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
        {ticket.assignee ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full text-[7px] text-white flex items-center justify-center font-medium"
              style={{ backgroundColor: ticket.assignee.avatarColor }}
            >
              {ticket.assignee.initials}
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{ticket.assignee.name}</span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/50 italic">Unassigned</span>
        )}
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
          <Clock className="w-2.5 h-2.5" />
          {formatDate(ticket.updatedAt)}
        </span>
      </div>
    </motion.a>
  );
};

interface KanbanBoardProps {
  tickets: JiraTicket[];
}

export const KanbanBoard = ({ tickets }: KanbanBoardProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
      {columns.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            className={`flex-shrink-0 w-[260px] lg:w-auto lg:flex-1 bg-muted/30 rounded-2xl border-t-[3px] ${col.borderColor}`}
          >
            {/* Column header */}
            <div className="p-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <col.icon className={`w-4 h-4 ${col.color}`} />
                <span className="text-xs font-semibold text-foreground">{col.key}</span>
              </div>
              <span className={`text-xs font-bold ${col.color}`}>{colTickets.length}</span>
            </div>

            {/* Cards */}
            <div className="px-2.5 pb-2.5 space-y-2 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {colTickets.map((ticket) => (
                  <KanbanCard key={ticket.id} ticket={ticket} />
                ))}
              </AnimatePresence>
              {colTickets.length === 0 && (
                <div className="flex items-center justify-center h-[100px] text-[11px] text-muted-foreground/50 italic">
                  No tickets
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
