import { Circle, Loader2, Eye, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { JiraTicket } from '@/data/mockData';

const statusConfig: Record<JiraTicket['status'], { icon: React.ElementType; className: string }> = {
  'To Do': { icon: Circle, className: 'bg-muted text-muted-foreground' },
  'In Progress': { icon: Loader2, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  'In Review': { icon: Eye, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  'Done': { icon: CheckCircle2, className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  'Blocked': { icon: AlertOctagon, className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export const TicketStatusBadge = ({ status }: { status: JiraTicket['status'] }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
};
