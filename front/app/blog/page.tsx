'use client';

import PageHero from '@/components/sections/PageHero';
import CTASection from '@/components/sections/CTASection';
import { useState } from 'react';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function BlogPage() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = Object.entries(t.blog.categories) as [string, string][];
  const posts = Object.entries(t.blog.posts) as [string, { title: string; excerpt: string; date: string; category: string }][];

  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter(([, post]) => post.category === activeCategory);

  const categoryColors: Record<string, string> = {
    calibration: 'hsl(205 45% 25%)',
    metrology: 'hsl(25 80% 50%)',
    standards: 'hsl(142 72% 29%)',
    news: 'hsl(262 83% 58%)',
  };

  return (
    <>
      <PageHero sectionKey="blog" />

      <section className="section-padding" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeCategory === key ? 'var(--gradient-hero)' : 'var(--card)',
                  color: activeCategory === key ? 'white' : 'var(--muted-foreground)',
                  border: `1px solid ${activeCategory === key ? 'transparent' : 'var(--border)'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filtered.map(([key, post]) => (
              <article
                key={key}
                className="group flex flex-col p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                {/* Category badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: categoryColors[post.category] || 'hsl(205 45% 25%)' }}
                  >
                    <Tag size={10} className="inline mr-1" />
                    {t.blog.categories[post.category as keyof typeof t.blog.categories] || post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Calendar size={11} />
                    {post.date}
                  </span>
                </div>

                <h3
                  className="font-bold text-lg mb-3 group-hover:text-[hsl(205_45%_25%)] transition-colors"
                  style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--muted-foreground)' }}>
                  {post.excerpt}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all"
                  style={{ color: 'hsl(205 45% 25%)' }}
                >
                  {t.blog.readMore}
                  <ArrowRight size={14} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
