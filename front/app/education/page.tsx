'use client';

import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import { Clock, Award, Users, BookOpen, CheckCircle } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function EducationPage() {
  const { t } = useLang();

  const courses = Object.entries(t.education.courses) as [string, { title: string; description: string; duration: string }][];

  const benefits = [
    { key: 'certificate', label: t.education.benefits.certificate, icon: Award },
    { key: 'practical', label: t.education.benefits.practical, icon: BookOpen },
    { key: 'expert', label: t.education.benefits.expert, icon: Users },
    { key: 'flexible', label: t.education.benefits.flexible, icon: Clock },
  ];

  return (
    <>
      <PageHero sectionKey="education" />

      <section className="section-padding" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description */}
          <p className="text-lg text-center max-w-3xl mx-auto mb-12" style={{ color: 'var(--muted-foreground)' }}>
            {t.education.description}
          </p>

          {/* Benefits */}
          <div
            className="p-6 rounded-2xl mb-12"
            style={{ background: 'hsl(205 45% 25% / 0.05)', border: '1px solid hsl(205 45% 25% / 0.15)' }}
          >
            <h3
              className="font-bold text-lg mb-4 text-center"
              style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
            >
              {t.education.benefits.title}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.key} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(205 45% 25% / 0.1)' }}
                    >
                      <Icon size={16} style={{ color: 'hsl(205 45% 25%)' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courses grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(([key, course]) => (
              <div
                key={key}
                className="flex flex-col p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'hsl(205 45% 25% / 0.08)' }}
                  >
                    <BookOpen size={20} style={{ color: 'hsl(205 45% 25%)' }} />
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'hsl(25 80% 50% / 0.1)', color: 'hsl(25 80% 45%)' }}
                  >
                    <Clock size={11} />
                    {course.duration}
                  </div>
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {course.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--muted-foreground)' }}>
                  {course.description}
                </p>
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--gradient-hero)' }}
                >
                  {t.education.register}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
