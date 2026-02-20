

# High-End SaaS Landing Page for AM PM

## Overview
Build a premium, modern landing page with an About section for AM PM -- a developer productivity and project management platform. The design will follow high-end SaaS standards (think Linear, Vercel, Raycast) with purposeful motion, clean typography, and a powerful hero section with graphic animation. No unnecessary gradients. No basic design.

## Route Architecture

- `/landing` -- Main landing page (will become the new `/` route)
- `/about` -- About page
- `/` -- Dashboard (moved to `/dashboard`)

The landing page and about page will NOT use the `AppLayout` (no sidebar). They get their own minimal navbar and footer.

## Page Structure

### Landing Page Sections

1. **Navbar** -- Minimal sticky nav with logo, links (Features, About, Pricing), and a "Get Started" CTA button. Transparent on scroll, with blur backdrop on scroll down.

2. **Hero Section** -- The centerpiece.
   - Bold headline with word-by-word staggered reveal animation (Framer Motion)
   - Subheadline fades in after
   - Two CTA buttons: "Get Started" (primary pill) and "See how it works" (ghost/outline)
   - **Graphic animation**: An animated dashboard mockup built with floating cards, ticket badges, and avatar stacks that assemble themselves on load using Framer Motion spring physics -- no static image, pure code-driven animation. Elements float, connect, and settle into a dashboard-like composition.

3. **Trusted By / Logos** -- A subtle horizontal marquee of company logos (placeholder styled blocks) with fade edges.

4. **Features Grid** -- 3-column bento-style grid with:
   - Each card has an icon, title, and description
   - Cards animate in on scroll (staggered `whileInView`)
   - Features: AI Chat Assistant, Smart Ticket Management, GitHub/Jira Integration, Team Workload Analytics, Sprint Burndowns, Real-time Activity Feed

5. **Product Showcase** -- A large centered card showing a stylized screenshot/mockup of the dashboard with a subtle floating shadow. Parallax-like scroll effect using Framer Motion `useScroll` + `useTransform`.

6. **Stats Section** -- Animated counters: "10x faster workflows", "500+ teams", "1M+ tickets managed" -- numbers count up on scroll into view.

7. **Testimonials** -- 3 testimonial cards in a row with avatar, quote, name, and role. Clean card design with subtle hover lift.

8. **CTA Section** -- Full-width section with bold headline, subtext, and a large "Get Started Free" button. Subtle animated background pattern (CSS grid dots or lines).

9. **Footer** -- Multi-column footer with links, social icons, copyright.

### About Page Sections

1. Same Navbar
2. **Hero** -- "About AM PM" with mission statement
3. **Story** -- Two-column layout with text and a values grid
4. **Team Showcase** -- Grid of team member cards pulling from mockData
5. **CTA** -- Same as landing page
6. Same Footer

## New Files

| File | Purpose |
|------|---------|
| `src/pages/Landing.tsx` | Main landing page with all sections |
| `src/pages/About.tsx` | About page |
| `src/components/landing/Navbar.tsx` | Landing page sticky navbar |
| `src/components/landing/Hero.tsx` | Hero section with animated graphic |
| `src/components/landing/Features.tsx` | Bento feature grid |
| `src/components/landing/Stats.tsx` | Animated counter stats |
| `src/components/landing/Testimonials.tsx` | Testimonial cards |
| `src/components/landing/Footer.tsx` | Multi-column footer |
| `src/components/landing/LogoMarquee.tsx` | Trusted-by logo scroll |
| `src/components/landing/ProductShowcase.tsx` | Dashboard mockup with scroll effect |
| `src/components/landing/CTASection.tsx` | Final call-to-action block |
| `src/components/landing/HeroDashboardGraphic.tsx` | The animated floating dashboard graphic |

## Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/landing` as new `/`, move dashboard to `/dashboard`, add `/about` route outside `AppLayout` |

## Animation Strategy (Framer Motion)

- **Hero text**: `variants` with staggered children, each word slides up + fades in
- **Dashboard graphic**: Spring-animated cards that translate from offscreen, rotate slightly, and settle. Continuous subtle floating with `animate` + `transition: { repeat: Infinity, repeatType: "reverse" }`
- **Scroll reveals**: `whileInView` with `once: true` on feature cards, stats, testimonials
- **Stats counters**: Custom hook that animates numbers from 0 to target using `useMotionValue` + `useTransform`
- **Logo marquee**: CSS `@keyframes` infinite horizontal scroll
- **Product showcase**: `useScroll` + `useTransform` for subtle Y-parallax and scale

## Design Principles

- **Color**: Primarily monochrome (black/white/gray) with coral (`--primary`) as the single accent color
- **Typography**: Inter for body, large bold headlines (48-72px on desktop)
- **Spacing**: Generous whitespace, 80-120px section padding
- **No unnecessary gradients**: Solid colors, subtle shadows, clean borders
- **Dark mode compatible**: All sections respect the existing theme system

## Technical Notes

- All animations use `framer-motion` (already installed)
- Responsive: mobile-first with breakpoints for tablet and desktop
- Landing navbar includes a "Login" link that routes to `/dashboard`
- The About page reuses Navbar and Footer components from landing

