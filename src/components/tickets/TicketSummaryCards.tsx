import { Circle, Loader2, Eye, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { JiraTicket } from '@/data/mockData';

interface TicketSummaryCardsProps {
  tickets: JiraTicket[];
}

const statuses: { key: JiraTicket['status']; icon: React.ElementType; color: string }[] = [
  { key: 'To Do', icon: Circle, color: 'text-muted-foreground' },
  { key: 'In Progress', icon: Loader2, color: 'text-blue-500' },
  { key: 'In Review', icon: Eye, color: 'text-amber-500' },
  { key: 'Done', icon: CheckCircle2, color: 'text-green-500' },
  { key: 'Blocked', icon: AlertOctagon, color: 'text-destructive' },
];

export const TicketSummaryCards = ({ tickets }: TicketSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {statuses.map((s) => {
        const count = tickets.filter((t) => t.status === s.key).length;
        return (
          <div key={s.key} className="airbnb-card p-4 text-center">
            <s.icon className={`w-4 h-4 mx-auto mb-1.5 ${s.color}`} />
            <div className={`text-xl font-bold ${s.color}`}>{count}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.key}</div>
          </div>
        );
      })}
    </div>
  );
};
