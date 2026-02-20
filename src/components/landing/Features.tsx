import { motion } from 'framer-motion';
import { MessageSquare, Ticket, GitBranch, BarChart3, TrendingDown, Activity } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Ask questions about your codebase, generate reports, and get intelligent suggestions — all through natural conversation.',
  },
  {
    icon: Ticket,
    title: 'Smart Ticket Management',
    description: 'Create, prioritize, and track tickets with AI-powered categorization and automatic status updates.',
  },
  {
    icon: GitBranch,
    title: 'GitHub & Jira Integration',
    description: 'Seamlessly connect your existing tools. Pull requests, commits, and issues sync in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Team Workload Analytics',
    description: 'Visualize capacity across your team. Spot bottlenecks before they become blockers.',
  },
  {
    icon: TrendingDown,
    title: 'Sprint Burndowns',
    description: 'Track sprint progress with real-time burndown charts and velocity metrics that actually make sense.',
  },
  {
    icon: Activity,
    title: 'Real-time Activity Feed',
    description: 'Stay in sync with a live feed of commits, reviews, deployments, and ticket changes across your org.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Everything your team needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One platform to manage tickets, code, and collaboration — no more tab switching.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const }}
              className="group relative p-6 rounded-2xl border border-border bg-card hover:bg-accent/30 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
