import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    price: '$0',
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
    price: '$24',
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
    price: 'Custom',
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
  return (
    <section id="pricing" className="py-24 md:py-32 px-6">
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
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free. Scale when you're ready. No surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, i) => (
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
                  <span className="text-4xl font-bold text-foreground tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  )}
                </div>
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
          ))}
        </div>
      </div>
    </section>
  );
};
