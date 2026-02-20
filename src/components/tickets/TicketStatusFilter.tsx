import type { JiraTicket } from '@/data/mockData';

interface TicketStatusFilterProps {
  tickets: JiraTicket[];
  activeStatus: string | undefined;
  onStatusChange: (status: string | undefined) => void;
}

const statuses: { key: JiraTicket['status']; dot: string }[] = [
  { key: 'To Do', dot: 'bg-muted-foreground/50' },
  { key: 'In Progress', dot: 'bg-blue-500' },
  { key: 'In Review', dot: 'bg-amber-500' },
  { key: 'Done', dot: 'bg-green-500' },
  { key: 'Blocked', dot: 'bg-destructive' },
];

export const TicketStatusFilter = ({ tickets, activeStatus, onStatusChange }: TicketStatusFilterProps) => {
  const isAll = !activeStatus || activeStatus === 'all';

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* All pill */}
      <button
        onClick={() => onStatusChange(undefined)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          isAll
            ? 'bg-foreground text-background shadow-sm'
            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        All
        <span className="text-xs opacity-70">{tickets.length}</span>
      </button>

      {statuses.map((s) => {
        const count = tickets.filter((t) => t.status === s.key).length;
        const isActive = activeStatus === s.key;

        return (
          <button
            key={s.key}
            onClick={() => onStatusChange(isActive ? undefined : s.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            {s.key}
            <span className="text-xs opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
