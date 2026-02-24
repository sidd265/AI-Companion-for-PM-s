import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { fetchTeamMembers } from '@/services/team';
import type { TeamMember } from '@/data/mockData';
import { Target, Zap, Shield, Heart } from 'lucide-react';

const values = [
  { icon: Target, title: 'Focus', description: 'We build tools that reduce noise and help teams focus on what matters.' },
  { icon: Zap, title: 'Speed', description: 'Every interaction should feel instant. Performance is a feature.' },
  { icon: Shield, title: 'Reliability', description: 'Your workflow depends on us. We take that responsibility seriously.' },
  { icon: Heart, title: 'Craft', description: 'We sweat the details because great tools inspire great work.' },
];

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchTeamMembers().then(setTeamMembers);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6"
          >
            About AM PM
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            We're building the productivity platform that engineering teams deserve — fast, focused, and free from the clutter of legacy tools.
          </motion.p>
        </div>
      </section>

      {/* Story + Values */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Our story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
              <p>
                AM PM started with a simple frustration: engineering teams spend more time managing tools than building products. Between Jira, Slack, GitHub, and a dozen dashboards, context-switching became the real bottleneck.
              </p>
              <p>
                We set out to build a single platform that unifies project management, code collaboration, and team analytics — powered by AI that actually understands your workflow.
              </p>
              <p>
                Today, AM PM helps hundreds of teams ship faster, stay aligned, and spend less time in meetings about meetings.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Our values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="p-4 rounded-xl border border-border bg-card">
                  <v.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              Meet the team
            </h2>
            <p className="text-muted-foreground">The people behind AM PM.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-center p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-semibold text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default About;
