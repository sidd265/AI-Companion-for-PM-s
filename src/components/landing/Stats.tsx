import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
}

const Counter = ({ target, suffix = '', prefix = '' }: CounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(String(v)));
    return unsubscribe;
  }, [rounded]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          animate(count, target, { duration: 2, ease: 'easeOut' });
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, target]);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
};

const stats = [
  { target: 10, suffix: 'x', label: 'Faster workflows' },
  { target: 500, suffix: '+', label: 'Teams worldwide' },
  { target: 1, suffix: 'M+', label: 'Tickets managed' },
  { target: 99, suffix: '%', label: 'Uptime SLA' },
];

export const Stats = () => {
  return (
    <section className="py-24 md:py-32 px-6 border-y border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
                <Counter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
