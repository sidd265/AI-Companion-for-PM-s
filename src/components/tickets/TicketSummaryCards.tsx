import { Circle, Loader2, Eye, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { JiraTicket } from '@/data/mockData';

interface TicketSummaryCardsProps {
  tickets: JiraTicket[];
}

const statuses: { key: JiraTicket['status']; icon: React.ElementType; color: string; bgClass: string }[] = [
  { key: 'To Do', icon: Circle, color: 'text-muted-foreground', bgClass: 'bg-muted/50' },
  { key: 'In Progress', icon: Loader2, color: 'text-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'In Review', icon: Eye, color: 'text-amber-500', bgClass: 'bg-amber-50 dark:bg-amber-950/30' },
  { key: 'Done', icon: CheckCircle2, color: 'text-green-500', bgClass: 'bg-green-50 dark:bg-green-950/30' },
  { key: 'Blocked', icon: AlertOctagon, color: 'text-destructive', bgClass: 'bg-red-50 dark:bg-red-950/30' },
];

export const TicketSummaryCards = ({ tickets }: TicketSummaryCardsProps) => {
  const total = tickets.length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statuses.map((s) => {
        const count = tickets.filter((t) => t.status === s.key).length;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={s.key} className="airbnb-card-static p-4 group hover:border-border/80 transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-xl ${s.bgClass} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.key}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-bold ${s.color}`}>{count}</span>
              <span className="text-[10px] text-muted-foreground/70 font-medium">{percentage}%</span>
            </div>
            {/* Mini progress bar */}
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  s.key === 'To Do' ? 'bg-muted-foreground/30' :
                  s.key === 'In Progress' ? 'bg-blue-500' :
                  s.key === 'In Review' ? 'bg-amber-500' :
                  s.key === 'Done' ? 'bg-green-500' :
                  'bg-destructive'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
