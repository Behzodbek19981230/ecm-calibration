'use client';

import { useLang } from '@/lib/LanguageContext';

interface PageHeroProps {
  sectionKey: 'services' | 'about' | 'accreditation' | 'education' | 'blog' | 'contact';
}

export default function PageHero({ sectionKey }: PageHeroProps) {
  const { t } = useLang();

  const sectionMap = {
    services: { title: t.services.title, subtitle: t.services.subtitle },
    about: { title: t.about.title, subtitle: t.about.subtitle },
    accreditation: { title: t.accreditation.title, subtitle: t.accreditation.subtitle },
    education: { title: t.education.title, subtitle: t.education.subtitle },
    blog: { title: t.blog.title, subtitle: t.blog.subtitle },
    contact: { title: t.contact.title, subtitle: t.contact.subtitle },
  };

  const section = sectionMap[sectionKey];

  return (
    <section
      className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {section.title}
        </h1>
        <p className="text-white/75 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
          {section.subtitle}
        </p>
      </div>
    </section>
  );
}
