import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "AM PM replaced three tools for us overnight. Our sprint velocity improved by 40% in the first month.",
    name: 'Sarah Chen',
    role: 'Engineering Lead, Acme Corp',
    initials: 'SC',
  },
  {
    quote: "The AI assistant is genuinely useful — it surfaces blockers before standup and auto-categorizes incoming tickets.",
    name: 'Marcus Rivera',
    role: 'VP of Engineering, TechFlow',
    initials: 'MR',
  },
  {
    quote: "Finally a project management tool that developers actually want to use. Clean, fast, and stays out of the way.",
    name: 'Emily Nakamura',
    role: 'CTO, Buildspace',
    initials: 'EN',
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Loved by engineering teams
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="w-5 h-5 text-primary/40 mb-4" />
              <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{t.initials}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
