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
    <section ref={ref} className="py-24 md:py-32 px-6">
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
              {['Active Tickets', 'Open PRs', 'Team Velocity', 'Commits'].map((label) => (
                <div key={label} className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <div className="h-3 w-16 bg-muted rounded mb-2" />
                  <div className="h-6 w-12 bg-foreground/10 rounded" />
                  <div className="mt-2 text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 h-40 md:h-48 rounded-xl bg-muted/30 border border-border/50 flex items-end p-4 gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="h-40 md:h-48 rounded-xl bg-muted/30 border border-border/50 p-4">
                <div className="h-3 w-20 bg-muted rounded mb-4" />
                <div className="space-y-3">
                  {[80, 60, 45, 30].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted" />
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className="h-full bg-primary/30 rounded-full" style={{ width: `${w}%` }} />
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
