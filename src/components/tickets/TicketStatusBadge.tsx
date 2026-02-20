import { Circle, Loader2, Eye, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { JiraTicket } from '@/data/mockData';

const statusConfig: Record<JiraTicket['status'], { icon: React.ElementType; className: string }> = {
  'To Do': { icon: Circle, className: 'bg-muted/80 text-muted-foreground border-border' },
  'In Progress': { icon: Loader2, className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' },
  'In Review': { icon: Eye, className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
  'Done': { icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' },
  'Blocked': { icon: AlertOctagon, className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
};

export const TicketStatusBadge = ({ status }: { status: JiraTicket['status'] }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};
