import { ArrowDown, ArrowRight, ArrowUp, Flame } from 'lucide-react';
import type { JiraTicket } from '@/data/mockData';

const priorityConfig: Record<JiraTicket['priority'], { icon: React.ElementType; color: string }> = {
  Low: { icon: ArrowDown, color: 'text-muted-foreground' },
  Medium: { icon: ArrowRight, color: 'text-amber-500' },
  High: { icon: ArrowUp, color: 'text-orange-500' },
  Critical: { icon: Flame, color: 'text-destructive' },
};

export const TicketPriorityBadge = ({ priority }: { priority: JiraTicket['priority'] }) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {priority}
    </span>
  );
};
