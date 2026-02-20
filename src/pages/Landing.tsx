import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { LogoMarquee } from '@/components/landing/LogoMarquee';
import { Features } from '@/components/landing/Features';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { Stats } from '@/components/landing/Stats';
import { Pricing } from '@/components/landing/Pricing';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Features />
      <ProductShowcase />
      <Stats />
      <Pricing />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
