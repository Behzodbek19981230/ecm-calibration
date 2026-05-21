import AboutSection from '@/components/sections/AboutSection';
import CTASection from '@/components/sections/CTASection';
import PageHero from '@/components/sections/PageHero';

export default function AboutPage() {
  return (
    <>
      <PageHero sectionKey="about" />
      <AboutSection />
      <CTASection />
    </>
  );
}
