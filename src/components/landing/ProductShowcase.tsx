import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const ProductShowcase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  return (
    <section ref={ref} className="py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Your command center
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A unified dashboard designed for speed and clarity.
          </p>
        </motion.div>

        <motion.div style={{ y, scale }} className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Mock browser chrome */}
          <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/30" />
            <div className="w-3 h-3 rounded-full bg-accent-foreground/15" />
            <div className="w-3 h-3 rounded-full bg-accent-foreground/15" />
            <div className="ml-6 flex-1 max-w-sm h-5 bg-muted rounded-full" />
          </div>

          {/* Dashboard mockup */}
          <div className="p-6 md:p-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Active Tickets', value: '36', change: '+4', up: true },
                { label: 'Open PRs', value: '12', change: '-2', up: false },
                { label: 'Team Velocity', value: '91%', change: '+8%', up: true },
                { label: 'Commits', value: '248', change: '+31', up: true },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-xl font-bold text-foreground">{stat.value}</span>
                    <span className={`text-[10px] font-semibold ${stat.up ? 'text-[hsl(var(--chart-3))]' : 'text-primary'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 rounded-xl bg-muted/30 border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-foreground">Sprint Burndown</span>
                  <span className="text-[10px] text-muted-foreground">Last 12 days</span>
                </div>
                <div className="flex items-end gap-2 h-36 md:h-44">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-colors ${i >= 10 ? 'bg-primary' : 'bg-primary/25'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                <span className="text-xs font-semibold text-foreground">Top Contributors</span>
                <div className="space-y-3 mt-4">
                  {[
                    { name: 'Sarah K.', pct: 80 },
                    { name: 'Alex M.', pct: 60 },
                    { name: 'James R.', pct: 45 },
                    { name: 'Priya L.', pct: 30 },
                  ].map((user) => (
                    <div key={user.name} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary">{user.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-foreground font-medium mb-0.5">{user.name}</div>
                        <div className="h-1.5 bg-muted rounded-full">
                          <div className="h-full bg-primary/40 rounded-full" style={{ width: `${user.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
