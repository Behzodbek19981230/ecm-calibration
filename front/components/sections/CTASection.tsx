'use client';

import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function CTASection() {
  const { t, company } = useLang();

  return (
    <section
      className="py-16"
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {t.contact.cta}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            {t.about.guarantee}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-accent)' }}
            >
              {t.common.getConsultation}
              <ArrowRight size={18} />
            </Link>
            <a
              href={`tel:${company.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base bg-white/10 border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <Phone size={18} />
              {company.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
