'use client';

import { MessageSquare, Calendar, Settings, FileCheck, Receipt, Package } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const stepIcons = [MessageSquare, Calendar, Settings, FileCheck, Receipt, Package];

export default function ProcessSection() {
  const { t } = useLang();

  const steps = Object.entries(t.process.steps) as [string, { title: string; description: string }][];

  return (
    <section className="section-padding" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{
              color: 'hsl(25 80% 50%)',
              background: 'hsl(25 80% 50% / 0.08)',
            }}
          >
            {t.process.subtitle}
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
          >
            {t.process.title}
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute top-10 left-8 right-8 h-0.5 hidden lg:block"
            style={{ background: 'var(--border)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {steps.map(([key, step], index) => {
              const Icon = stepIcons[index] || MessageSquare;
              return (
                <div key={key} className="relative flex flex-col items-center text-center">
                  {/* Step number circle */}
                  <div
                    className="relative w-16 h-16 rounded-full flex flex-col items-center justify-center mb-4 z-10 border-4"
                    style={{
                      background: index === 0 ? 'var(--gradient-accent)' : 'var(--card)',
                      borderColor: index === 0 ? 'transparent' : 'var(--border)',
                      color: index === 0 ? 'white' : 'hsl(205 45% 25%)',
                    }}
                  >
                    <Icon size={20} />
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'hsl(205 45% 25%)' }}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <h4
                    className="font-semibold text-sm mb-2"
                    style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
