import type { JiraTicket } from '@/data/mockData';

interface TicketStatusFilterProps {
  tickets: JiraTicket[];
  activeStatus: string | undefined;
  onStatusChange: (status: string | undefined) => void;
}

const statuses: { key: JiraTicket['status']; dot: string; tint: string; activeBg: string }[] = [
  { key: 'To Do', dot: 'bg-muted-foreground/50', tint: 'bg-muted/60 border-muted-foreground/20 hover:border-muted-foreground/40', activeBg: 'bg-muted-foreground text-background border-muted-foreground' },
  { key: 'In Progress', dot: 'bg-blue-500', tint: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:border-blue-400', activeBg: 'bg-blue-600 text-white border-blue-600' },
  { key: 'In Review', dot: 'bg-amber-500', tint: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:border-amber-400', activeBg: 'bg-amber-500 text-white border-amber-500' },
  { key: 'Done', dot: 'bg-green-500', tint: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 hover:border-green-400', activeBg: 'bg-green-600 text-white border-green-600' },
  { key: 'Blocked', dot: 'bg-destructive', tint: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 hover:border-red-400', activeBg: 'bg-red-600 text-white border-red-600' },
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
                ? `${s.activeBg} shadow-lg scale-[1.02]`
                : `${s.tint} text-muted-foreground hover:shadow-md`
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
