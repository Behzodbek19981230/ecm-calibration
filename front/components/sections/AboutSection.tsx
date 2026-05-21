'use client';

import Link from 'next/link';
import { Target, Eye, Award, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function AboutSection() {
  const { t } = useLang();

  const values = [
    { key: 'precision', icon: Target, label: t.about.values.precision },
    { key: 'reliability', icon: Award, label: t.about.values.reliability },
    { key: 'innovation', icon: Eye, label: t.about.values.innovation },
    { key: 'customer', icon: Users, label: t.about.values.customer },
  ];

  const features = [
    { key: 'precision', ...t.about.features.precision },
    { key: 'certificate', ...t.about.features.certificate },
    { key: 'experience', ...t.about.features.experience },
  ];

  return (
    <section
      className="section-padding"
      style={{ background: 'hsl(210 20% 96%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{
                color: 'hsl(205 45% 25%)',
                background: 'hsl(205 45% 25% / 0.08)',
              }}
            >
              {t.nav.about}
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
            >
              {t.about.title}
            </h2>
            <p
              className="text-lg font-medium mb-4"
              style={{ color: 'hsl(205 45% 25%)' }}
            >
              {t.about.subtitle}
            </p>
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
              {t.about.description}
            </p>

            {/* Mission & Vision */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <Target size={20} className="shrink-0 mt-0.5" style={{ color: 'hsl(205 45% 25%)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{t.about.mission}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <Eye size={20} className="shrink-0 mt-0.5" style={{ color: 'hsl(25 80% 50%)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{t.about.vision}</p>
                </div>
              </div>
            </div>

            {/* History */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
              {t.about.history.description}
            </p>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-semibold text-sm transition-colors hover:gap-3"
              style={{ color: 'hsl(205 45% 25%)' }}
            >
              {t.common.learnMore}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: Cards */}
          <div className="space-y-4">
            {/* Features */}
            {features.map(f => (
              <div
                key={f.key}
                className="flex items-start gap-4 p-5 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <CheckCircle size={22} className="shrink-0 mt-0.5" style={{ color: 'hsl(205 45% 25%)' }} />
                <div>
                  <h4
                    className="font-semibold text-sm mb-1"
                    style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {f.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{f.description}</p>
                </div>
              </div>
            ))}

            {/* Values */}
            <div className="p-5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h4
                className="font-semibold text-sm mb-4"
                style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {t.about.values.title}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {values.map(v => {
                  const Icon = v.icon;
                  return (
                    <div key={v.key} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'hsl(205 45% 25% / 0.08)' }}
                      >
                        <Icon size={14} style={{ color: 'hsl(205 45% 25%)' }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{v.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guarantee */}
            <div
              className="p-5 rounded-2xl text-white"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <p className="font-semibold text-base">{t.about.guarantee}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
