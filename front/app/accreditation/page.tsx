'use client';

import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import {
  Scale, Thermometer, FlaskConical, Ruler, Gauge, Zap,
  Dumbbell, Wrench, Diamond, FileText, Award, Microscope, Download
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const serviceIcons = [Scale, Thermometer, FlaskConical, Ruler, Gauge, Zap, Dumbbell, Wrench, Diamond];

export default function AccreditationPage() {
  const { t } = useLang();

  const services = Object.entries(t.services.items) as [string, { title: string; description: string }][];

  return (
    <>
      <PageHero sectionKey="accreditation" />

      <section className="section-padding" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status banner */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl border mb-12"
            style={{
              background: 'hsl(205 45% 25% / 0.05)',
              borderColor: 'hsl(205 45% 25% / 0.2)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <p className="text-sm" style={{ color: 'hsl(205 45% 25%)' }}>
              {t.accreditation.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Scope */}
            <div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {t.accreditation.scope.title}
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                {t.accreditation.scope.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(([key, service], i) => {
                  const Icon = serviceIcons[i] || Scale;
                  return (
                    <div
                      key={key}
                      className="flex items-start gap-3 p-4 rounded-xl border"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'hsl(205 45% 25% / 0.08)' }}
                      >
                        <Icon size={16} style={{ color: 'hsl(205 45% 25%)' }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{service.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Standards, Certificates, Equipment */}
            <div className="space-y-6">
              {/* Standards */}
              <div
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award size={20} style={{ color: 'hsl(205 45% 25%)' }} />
                  <h3
                    className="font-bold text-lg"
                    style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t.accreditation.standards.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    t.accreditation.standards.iso17025,
                    t.accreditation.standards.gum,
                    t.accreditation.standards.ilac,
                  ].map((std, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: 'hsl(25 80% 50%)' }} />
                      {std}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certificates */}
              <div
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={20} style={{ color: 'hsl(25 80% 50%)' }} />
                  <h3
                    className="font-bold text-lg"
                    style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t.accreditation.certificates.title}
                  </h3>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  {t.accreditation.certificates.description}
                </p>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--gradient-hero)' }}
                >
                  <Download size={14} />
                  {t.accreditation.download}
                </button>
              </div>

              {/* Equipment */}
              <div
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Microscope size={20} style={{ color: 'hsl(205 45% 25%)' }} />
                  <h3
                    className="font-bold text-lg"
                    style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t.accreditation.equipment.title}
                  </h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {t.accreditation.equipment.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
