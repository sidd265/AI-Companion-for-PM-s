import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const tiers = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: '/month',
    description: 'For individuals and small side projects.',
    features: [
      'Up to 3 team members',
      '100 tickets per month',
      'Basic GitHub integration',
      'Community support',
      '1 project',
    ],
    cta: 'Get Started',
    href: '/dashboard',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: '$24',
    annualPrice: '$19',
    period: '/user/mo',
    description: 'For growing teams shipping fast.',
    features: [
      'Unlimited team members',
      'Unlimited tickets',
      'GitHub + Jira integration',
      'AI chat assistant',
      'Sprint analytics & burndowns',
      'Priority support',
      'Custom workflows',
    ],
    cta: 'Start Free Trial',
    href: '/dashboard',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    period: '',
    description: 'For organizations that need scale and control.',
    features: [
      'Everything in Pro',
      'SSO & SAML',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security & audit logs',
      'SLA guarantee',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    href: '/about',
    highlighted: false,
  },
];

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-16 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Start free. Scale when you're ready. No surprises.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                !isAnnual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnnual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, i) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            const showSavings = isAnnual && tier.monthlyPrice !== tier.annualPrice && tier.monthlyPrice !== 'Custom';

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  tier.highlighted
                    ? 'border-primary bg-card shadow-lg scale-[1.02]'
                    : 'border-border bg-card'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={price}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl font-bold text-foreground tracking-tight"
                      >
                        {price}
                      </motion.span>
                    </AnimatePresence>
                    {tier.period && (
                      <span className="text-sm text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  {showSavings && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-primary font-medium mt-1"
                    >
                      Billed annually · Save 20%
                    </motion.p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={tier.href}
                  className={`block text-center rounded-full py-3 text-sm font-semibold transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'border border-border text-foreground hover:bg-secondary'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
