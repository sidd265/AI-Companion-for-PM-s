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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {/* All tile */}
      <button
        onClick={() => onStatusChange(undefined)}
        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-5 transition-all ${
          isAll
            ? 'bg-foreground text-background border-foreground shadow-lg scale-[1.02]'
            : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:shadow-md'
        }`}
      >
        <span className="text-2xl font-bold leading-none">{tickets.length}</span>
        <span className="text-xs font-semibold uppercase tracking-wider">All</span>
      </button>

      {statuses.map((s) => {
        const count = tickets.filter((t) => t.status === s.key).length;
        const isActive = activeStatus === s.key;

        return (
          <button
            key={s.key}
            onClick={() => onStatusChange(isActive ? undefined : s.key)}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-5 transition-all ${
              isActive
                ? 'bg-foreground text-background border-foreground shadow-lg scale-[1.02]'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${s.dot}`} />
              <span className="text-2xl font-bold leading-none">{count}</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{s.key}</span>
          </button>
        );
      })}
    </div>
  );
};
