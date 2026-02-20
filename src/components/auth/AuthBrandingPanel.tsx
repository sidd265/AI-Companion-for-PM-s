import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, BarChart3, GitBranch, Rocket } from 'lucide-react';

const floatingIcons = [
  { Icon: Zap, x: '12%', y: '18%', delay: 0, size: 20 },
  { Icon: Shield, x: '78%', y: '14%', delay: 0.3, size: 18 },
  { Icon: Users, x: '85%', y: '72%', delay: 0.6, size: 22 },
  { Icon: BarChart3, x: '10%', y: '75%', delay: 0.9, size: 18 },
  { Icon: GitBranch, x: '22%', y: '48%', delay: 1.2, size: 16 },
  { Icon: Rocket, x: '75%', y: '45%', delay: 0.5, size: 20 },
];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

interface AuthBrandingPanelProps {
  headline: string;
  description: string;
}

export const AuthBrandingPanel = ({ headline, description }: AuthBrandingPanelProps) => {
  const words = headline.split(' ');

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-primary/[0.03] dark:bg-primary/[0.06]">
      {/* Animated dot grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Radial glow behind logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/20 dark:text-primary/15"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 + delay, ease: 'backOut' }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      ))}

      {/* Orbiting ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-primary/[0.07]"
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 360 }}
        transition={{
          scale: { duration: 0.8, delay: 0.5 },
          opacity: { duration: 0.8, delay: 0.5 },
          rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
        }}
      >
        <motion.div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/30"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Second ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-dashed border-primary/[0.05]"
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: -360 }}
        transition={{
          scale: { duration: 0.8, delay: 0.7 },
          opacity: { duration: 0.8, delay: 0.7 },
          rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-md px-12 text-center">
        {/* Logo with pulse glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-primary rounded-xl"
                animate={{ boxShadow: [
                  '0 0 0px 0px hsl(var(--primary) / 0)',
                  '0 0 20px 6px hsl(var(--primary) / 0.25)',
                  '0 0 0px 0px hsl(var(--primary) / 0)',
                ] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground text-xl font-bold tracking-tight">A</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">AM PM</span>
          </Link>
        </motion.div>

        {/* Staggered headline */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-5 flex flex-wrap justify-center gap-x-2.5 gap-y-1"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {words.map((word, i) => (
            <motion.span key={i} variants={wordReveal}>
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {/* Description with delayed fade */}
        <motion.p
          className="text-muted-foreground leading-relaxed max-w-sm mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {description}
        </motion.p>

        {/* Animated stats bar */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          {[
            { label: 'Teams', value: '2,000+' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Faster', value: '3×' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.4 + i * 0.15 }}
            >
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
