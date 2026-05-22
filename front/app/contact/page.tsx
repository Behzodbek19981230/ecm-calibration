'use client';

import PageHero from '@/components/sections/PageHero';
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function ContactPage() {
  const { lang, t, company } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then((r) => { if (!r.ok) throw new Error(); });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <>
      <PageHero sectionKey="contact" />

      <section className="section-padding" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {t.contact.title}
              </h2>
              <p className="text-base mb-8" style={{ color: 'var(--muted-foreground)' }}>
                {t.contact.cta}
              </p>

              <div className="space-y-4">
                {/* Address */}
                <div
                  className="flex items-start gap-4 p-4 rounded-xl border"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'hsl(205 45% 25% / 0.1)' }}
                  >
                    <MapPin size={18} style={{ color: 'hsl(205 45% 25%)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                      {t.contact.info.address}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {company.address[lang]}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <a
                  href={`tel:${company.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'hsl(205 45% 25% / 0.1)' }}
                  >
                    <Phone size={18} style={{ color: 'hsl(205 45% 25%)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--foreground)' }}>
                      {t.contact.info.phone}
                    </p>
                    <p className="text-sm" style={{ color: 'hsl(205 45% 25%)' }}>{company.phone}</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'hsl(25 80% 50% / 0.1)' }}
                  >
                    <Mail size={18} style={{ color: 'hsl(25 80% 50%)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--foreground)' }}>
                      {t.contact.info.email}
                    </p>
                    <p className="text-sm" style={{ color: 'hsl(25 80% 50%)' }}>{company.email}</p>
                  </div>
                </a>

                {/* Work hours */}
                <div
                  className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'hsl(142 72% 29% / 0.1)' }}
                  >
                    <Clock size={18} style={{ color: 'hsl(142 72% 29%)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--foreground)' }}>
                      {t.contact.info.workHours}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {t.contact.info.workHoursValue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="mt-6 flex gap-3">
                <a
                  href={company.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={company.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ background: '#0088CC' }}
                >
                  <Send size={14} />
                  Telegram
                </a>
              </div>

              {/* Map placeholder */}
              <div
                className="mt-6 rounded-2xl overflow-hidden border h-56 flex items-center justify-center"
                style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.5!2d69.2!3d41.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDEyJzAwLjAiTiA2OcKwMTInMDAuMCJF!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="ECM Calibration Location"
                />
              </div>
            </div>

            {/* Contact form */}
            <div
              className="p-8 rounded-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={22} style={{ color: 'hsl(205 45% 25%)' }} />
                <h3
                  className="text-xl font-bold"
                  style={{ color: 'var(--foreground)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {t.contact.title}
                </h3>
              </div>

              {/* Success/Error alerts */}
              {status === 'success' && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm text-green-700"
                  style={{ background: 'hsl(142 72% 29% / 0.1)' }}
                >
                  <CheckCircle size={16} />
                  {t.toast.success}
                </div>
              )}
              {status === 'error' && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm text-red-600"
                  style={{ background: 'hsl(0 84% 60% / 0.1)' }}
                >
                  <AlertCircle size={16} />
                  {t.toast.error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                      {t.contact.form.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      placeholder={t.contact.form.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                      {t.contact.form.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      placeholder="+998 XX XXX XX XX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    placeholder={t.contact.form.email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    {t.contact.form.company}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    placeholder={t.contact.form.company}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    {t.contact.form.subject}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    placeholder={t.contact.form.subject}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    {t.contact.form.message}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all resize-none"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    placeholder={t.contact.form.message}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 hover:shadow-md disabled:opacity-60"
                  style={{ background: 'var(--gradient-accent)' }}
                >
                  {status === 'sending' ? t.contact.form.sending : t.contact.form.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
