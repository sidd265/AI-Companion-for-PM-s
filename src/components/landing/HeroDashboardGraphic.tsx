import { motion } from 'framer-motion';
import { CheckCircle2, GitPullRequest, Users, BarChart3, MessageSquare, Zap } from 'lucide-react';

const floatAnimation = (delay: number) => ({
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
    delay,
  },
});

export const HeroDashboardGraphic = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3]">
      {/* Main dashboard card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.3 }}
        className="absolute inset-4 md:inset-8 rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
      >
        <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive/40" />
          <div className="w-3 h-3 rounded-full bg-accent-foreground/20" />
          <div className="w-3 h-3 rounded-full bg-accent-foreground/20" />
          <div className="ml-4 h-4 w-32 bg-muted rounded" />
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/60 border border-border/50" />
          ))}
          <div className="col-span-2 h-28 rounded-lg bg-muted/40 border border-border/50" />
          <div className="h-28 rounded-lg bg-muted/40 border border-border/50" />
        </div>
      </motion.div>

      {/* Floating ticket card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0, ...floatAnimation(0) }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.6 }}
        className="absolute -top-2 -right-2 md:top-2 md:right-0 w-48 md:w-56 bg-card border border-border rounded-xl p-3 shadow-lg z-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">TICKET-1284</span>
        </div>
        <div className="h-2.5 w-3/4 bg-muted rounded mb-1.5" />
        <div className="h-2 w-1/2 bg-muted/60 rounded" />
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-5 px-2 bg-primary/10 text-primary text-[10px] font-medium rounded-full flex items-center">In Progress</div>
          <div className="h-5 px-2 bg-muted text-muted-foreground text-[10px] font-medium rounded-full flex items-center">High</div>
        </div>
      </motion.div>

      {/* Floating PR card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0, ...floatAnimation(0.5) }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.8 }}
        className="absolute bottom-4 -left-2 md:bottom-8 md:-left-4 w-44 md:w-52 bg-card border border-border rounded-xl p-3 shadow-lg z-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <GitPullRequest className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">feat/auth-flow</span>
        </div>
        <div className="h-2.5 w-full bg-muted rounded mb-1.5" />
        <div className="h-2 w-2/3 bg-muted/60 rounded" />
        <div className="mt-2.5 flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30" />
          <div className="w-5 h-5 rounded-full bg-muted border border-border -ml-1.5" />
          <span className="text-[10px] text-muted-foreground ml-1">+2 reviewers</span>
        </div>
      </motion.div>

      {/* Floating avatar stack */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0, ...floatAnimation(1) }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 1.0 }}
        className="absolute top-6 -left-2 md:top-12 md:left-0 bg-card border border-border rounded-xl p-2.5 shadow-lg z-10"
      >
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">Team Online</span>
        </div>
        <div className="flex -space-x-2 mt-2">
          {['bg-primary/60', 'bg-primary/40', 'bg-primary/20', 'bg-muted'].map((bg, i) => (
            <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-card`} />
          ))}
        </div>
      </motion.div>

      {/* Floating stats mini */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0, ...floatAnimation(1.5) }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 1.2 }}
        className="absolute bottom-0 right-4 md:-bottom-2 md:right-8 bg-card border border-border rounded-xl p-2.5 shadow-lg z-10"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-foreground">+27%</span>
          <span className="text-[10px] text-muted-foreground">velocity</span>
        </div>
      </motion.div>

      {/* AI chat bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0, ...floatAnimation(2) }}
        transition={{ type: 'spring' as const, stiffness: 120, damping: 20, delay: 1.4 }}
        className="absolute top-1/2 -right-4 md:-right-8 bg-primary text-primary-foreground rounded-xl p-2.5 shadow-lg z-10"
      >
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium">AI Assistant</span>
          <Zap className="w-3 h-3" />
        </div>
      </motion.div>
    </div>
  );
};
