import { motion } from 'framer-motion';

const logos = [
  'Vercel', 'Stripe', 'Linear', 'Notion', 'Figma', 'GitHub', 'Slack', 'Raycast',
  'Vercel', 'Stripe', 'Linear', 'Notion', 'Figma', 'GitHub', 'Slack', 'Raycast',
];

export const LogoMarquee = () => {
  return (
    <section className="py-16 border-y border-border/50 overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-8"
      >
        Trusted by teams at
      </motion.p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-marquee gap-12 items-center">
          {logos.map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-6 py-2 text-sm font-semibold text-muted-foreground/40 tracking-wide select-none"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
