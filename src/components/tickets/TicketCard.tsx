import { FileText, Bug, Zap, Layers, ExternalLink } from 'lucide-react';
import type { JiraTicket } from '@/data/mockData';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { getTicketUrl } from '@/services/tickets';

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

export const TicketCard = ({ ticket }: { ticket: JiraTicket }) => {
  const Icon = typeIcon[ticket.type];

  return (
    <a
      href={getTicketUrl(ticket)}
      target="_blank"
      rel="noopener noreferrer"
      className="airbnb-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[ticket.type]}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {ticket.title}
          </span>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">{ticket.key}</span>
          <span>{ticket.project}</span>
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
        {ticket.assignee && (
          <div className="flex items-center gap-1.5 mt-2">
            <div
              className="w-5 h-5 rounded-full text-[7px] text-white flex items-center justify-center font-medium"
              style={{ backgroundColor: ticket.assignee.avatarColor }}
            >
              {ticket.assignee.initials}
            </div>
            <span className="text-[11px] text-muted-foreground">{ticket.assignee.name}</span>
          </div>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
    </a>
  );
};
