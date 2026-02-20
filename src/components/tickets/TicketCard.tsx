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

const typeColor: Record<JiraTicket['type'], string> = {
  Story: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400',
  Bug: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
  Task: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  Epic: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
};

const typeLabel: Record<JiraTicket['type'], string> = {
  Story: 'Story',
  Bug: 'Bug',
  Task: 'Task',
  Epic: 'Epic',
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
      className="block airbnb-card-static p-4 hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[ticket.type]}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: title + status */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                {ticket.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {ticket.key}
                </span>
                <span className="text-[11px] text-muted-foreground/60">·</span>
                <span className={`text-[11px] font-medium ${typeColor[ticket.type].split(' ')[0]}`}>
                  {typeLabel[ticket.type]}
                </span>
                <span className="text-[11px] text-muted-foreground/60">·</span>
                <span className="text-[11px] text-muted-foreground">{ticket.project}</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0" />
          </div>

          {/* Bottom row: meta */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            
            {ticket.assignee && (
              <>
                <span className="text-[11px] text-muted-foreground/40">·</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full text-[7px] text-white flex items-center justify-center font-medium"
                    style={{ backgroundColor: ticket.assignee.avatarColor }}
                  >
                    {ticket.assignee.initials}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{ticket.assignee.name}</span>
                </div>
              </>
            )}

            <span className="text-[11px] text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDate(ticket.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};
