import { FileText, Bug, Zap, Layers, ExternalLink, Clock } from 'lucide-react';
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

const typeLabel: Record<JiraTicket['type'], string> = {
  Story: 'Story',
  Bug: 'Bug',
  Task: 'Task',
  Epic: 'Epic',
};

const typeColor: Record<JiraTicket['type'], string> = {
  Story: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400',
  Bug: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
  Task: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  Epic: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
};

const priorityBorder: Record<JiraTicket['priority'], string> = {
  Critical: 'border-l-red-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-amber-400',
  Low: 'border-l-border',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const TicketCard = ({ ticket }: { ticket: JiraTicket }) => {
  const Icon = typeIcon[ticket.type];

  return (
    <a
      href={getTicketUrl(ticket)}
      target="_blank"
      rel="noopener noreferrer"
      className={`block airbnb-card-static p-5 hover:border-primary/20 transition-all group border-l-[3px] ${priorityBorder[ticket.priority]}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[ticket.type]}`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {ticket.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {ticket.key}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">{typeLabel[ticket.type]}</span>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(ticket.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: assignee + external icon */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <ExternalLink className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          {ticket.assignee && (
            <div className="flex items-center gap-1.5 mt-auto">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">{ticket.assignee.name}</span>
              <div
                className="w-6 h-6 rounded-full text-[8px] text-white flex items-center justify-center font-medium"
                style={{ backgroundColor: ticket.assignee.avatarColor }}
              >
                {ticket.assignee.initials}
              </div>
            </div>
          )}
        </div>
      </div>
    </a>
  );
};
