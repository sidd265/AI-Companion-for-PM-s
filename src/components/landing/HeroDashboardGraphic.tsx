import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  CheckCircle2,
  GitPullRequest,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
  Bell,
  Search,
  LayoutDashboard,
  ListTodo,
  Settings,
  TrendingUp,
  Circle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

const floatAnimation = (delay: number, amplitude = 6) => ({
  y: [0, -amplitude, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
    delay,
  },
});

// pulseGlow handled via CSS keyframes

// Mini bar chart data
const barData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95];

// Activity items
const activities = [
  { user: 'S', color: 'bg-primary/70', action: 'merged PR #142', time: '2m ago' },
  { user: 'A', color: 'bg-chart-3', action: 'closed TICKET-89', time: '5m ago' },
  { user: 'M', color: 'bg-chart-4', action: 'commented on sprint', time: '8m ago' },
];

// Ticket rows
const tickets = [
  { id: 'TK-1284', title: 'Auth flow redesign', status: 'In Progress', priority: 'High', color: 'bg-primary' },
  { id: 'TK-1283', title: 'API rate limiting', status: 'Review', priority: 'Med', color: 'bg-chart-3' },
  { id: 'TK-1282', title: 'Dashboard charts', status: 'Done', priority: 'Low', color: 'bg-chart-4' },
  { id: 'TK-1281', title: 'User onboarding', status: 'Todo', priority: 'High', color: 'bg-primary' },
];

export const HeroDashboardGraphic = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.6, 1, 1, 0.7]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ perspective: '1200px' }}>
      <motion.div style={{ rotateX, scale, opacity, y }} className="relative">
        {/* Main browser window */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }}
          className="relative rounded-2xl bg-card border border-border overflow-hidden"
          style={{ boxShadow: '0 25px 80px -12px hsl(0 0% 0% / 0.2), 0 0 0 1px hsl(var(--border))' }}
        >
          {/* Browser chrome */}
          <div className="h-11 bg-muted/60 border-b border-border flex items-center px-4 gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-accent-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-accent-foreground/20" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-background/80 border border-border rounded-lg px-3 py-1.5 w-64 md:w-80">
                <Search className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">app.ampm.dev/dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30" />
            </div>
          </div>

          {/* Dashboard body */}
          <div className="flex min-h-[320px] md:min-h-[380px]">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-44 border-r border-border bg-muted/30 p-3 gap-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 text-primary">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Dashboard</span>
              </div>
              {[
                { icon: ListTodo, label: 'Tickets' },
                { icon: GitPullRequest, label: 'Pull Requests' },
                { icon: Users, label: 'Team' },
                { icon: BarChart3, label: 'Analytics' },
                { icon: MessageSquare, label: 'AI Assistant' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">{label}</span>
                </div>
              ))}
              <div className="mt-auto flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Settings</span>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 md:p-5 space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-foreground">Sprint Dashboard</div>
                  <div className="text-[10px] text-muted-foreground">Sprint 24 · Feb 14 – Feb 28</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> AI Insights
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'Open Tickets', value: '24', change: '-3', up: false },
                  { label: 'PRs Merged', value: '18', change: '+5', up: true },
                  { label: 'Velocity', value: '87%', change: '+12%', up: true },
                  { label: 'Cycle Time', value: '2.4d', change: '-0.8d', up: true },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="rounded-xl bg-muted/40 border border-border/50 p-3"
                  >
                    <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-lg font-bold text-foreground">{stat.value}</span>
                      <span className={`text-[10px] font-semibold flex items-center ${stat.up ? 'text-[hsl(var(--chart-3))]' : 'text-primary'}`}>
                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : null}
                        {stat.change}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Content grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Mini chart */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="md:col-span-2 rounded-xl bg-muted/30 border border-border/50 p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold text-foreground">Sprint Burndown</span>
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex items-end gap-[3px] h-16">
                    {barData.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1.2 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                        className={`flex-1 rounded-sm ${i >= barData.length - 2 ? 'bg-primary' : 'bg-primary/30'}`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Ticket list */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="md:col-span-3 rounded-xl bg-muted/30 border border-border/50 p-3"
                >
                  <div className="text-[10px] font-semibold text-foreground mb-2">Active Tickets</div>
                  <div className="space-y-1.5">
                    {tickets.map((ticket, i) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + i * 0.08 }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
                      >
                        <Circle className={`w-2 h-2 fill-current ${ticket.status === 'Done' ? 'text-[hsl(var(--chart-3))]' : ticket.status === 'In Progress' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-[10px] font-mono text-muted-foreground w-14">{ticket.id}</span>
                        <span className="text-[10px] text-foreground flex-1 truncate">{ticket.title}</span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                          ticket.status === 'In Progress' ? 'bg-primary/10 text-primary' :
                          ticket.status === 'Done' ? 'bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]' :
                          ticket.status === 'Review' ? 'bg-accent text-accent-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {ticket.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating cards with parallax */}
        {/* Ticket notification */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, ...floatAnimation(0, 8) }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 1.5 }}
          className="absolute -top-6 -right-3 md:-top-4 md:-right-6 w-52 md:w-60 bg-card border border-border rounded-xl p-3.5 shadow-xl z-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">New PR Merged</span>
            <span className="text-[9px] text-muted-foreground ml-auto">just now</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">S</span>
            </div>
            <div>
              <div className="text-[10px] text-foreground font-medium">feat/auth-flow #142</div>
              <div className="text-[9px] text-muted-foreground">3 files changed, +124 -31</div>
            </div>
          </div>
        </motion.div>

        {/* AI Chat bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, ...floatAnimation(1, 5) }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 1.7 }}
          className="absolute -bottom-4 -left-3 md:-bottom-6 md:-left-6 w-56 md:w-64 bg-card border border-primary/30 rounded-xl p-3.5 shadow-xl z-10 animate-[pulseGlow_3s_ease-in-out_infinite]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-[11px] font-bold text-foreground">AI Assistant</span>
            <div className="ml-auto flex gap-0.5">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1 h-1 rounded-full bg-primary" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 rounded-full bg-primary" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 rounded-full bg-primary" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 2.2, duration: 1.5, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                Sprint velocity is up 12%. Suggest closing 3 stale tickets...
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, ...floatAnimation(0.5, 6) }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 1.9 }}
          className="absolute -bottom-2 right-4 md:-bottom-5 md:right-8 w-44 md:w-48 bg-card border border-border rounded-xl p-3 shadow-xl z-10"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground">Activity</span>
          </div>
          <div className="space-y-1.5">
            {activities.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 + i * 0.15 }}
                className="flex items-center gap-1.5"
              >
                <div className={`w-4 h-4 rounded-full ${a.color} flex items-center justify-center`}>
                  <span className="text-[7px] font-bold text-primary-foreground">{a.user}</span>
                </div>
                <span className="text-[9px] text-muted-foreground truncate flex-1">{a.action}</span>
                <span className="text-[8px] text-muted-foreground/60">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team online */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, ...floatAnimation(1.5, 7) }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 2.0 }}
          className="absolute top-8 -left-2 md:top-12 md:-left-4 bg-card border border-border rounded-xl p-2.5 shadow-xl z-10"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground">5 online</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-3))] animate-pulse" />
          </div>
          <div className="flex -space-x-1.5">
            {['bg-primary/70', 'bg-primary/50', 'bg-chart-3', 'bg-chart-4', 'bg-muted-foreground/40'].map((bg, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.3 + i * 0.08, type: 'spring', stiffness: 200 }}
                className={`w-5 h-5 rounded-full ${bg} border-2 border-card`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
