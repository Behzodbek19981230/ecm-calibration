import ServicesSection from '@/components/sections/ServicesSection';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';

export default function ServicesPage() {
  return (
    <>
      <PageHero sectionKey="services" />
      <ServicesSection />
      <CTASection />
    </>
  );
}
