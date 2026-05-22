import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, User } from 'lucide-react';
import api from '../lib/api';
import { useLang } from '../lib/LangContext';
import type { Lang } from '../lib/i18n';

const LANG_FLAGS: Record<Lang, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
const LANGS: Lang[] = ['uz', 'ru', 'en'];

export default function Login() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('ecm_token', data.token);
      localStorage.setItem('ecm_user', data.username);
      localStorage.setItem('ecm_fullName', data.fullName || data.username);
      localStorage.setItem('ecm_roles', JSON.stringify(data.roles || []));
      navigate('/dashboard');
    } catch {
      setError(t.login.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4">

      {/* Lang switcher */}
      <div className="flex gap-1 mb-6">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              lang === l
                ? 'text-white'
                : 'text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            style={lang === l ? { background: 'hsl(205,45%,25%)' } : {}}
          >
            {LANG_FLAGS[l]} {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-4"
            style={{ background: 'hsl(205,45%,25%)' }}
          >
            <img src="/logo.png" alt="ECM" className="h-9 w-auto object-contain brightness-0 invert" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t.nav.brandName}</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">{t.login.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-700 dark:text-slate-200 mb-5">{t.login.heading}</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl mb-4 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t.login.username}
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  required
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none transition-all bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-600 focus:border-[hsl(205,45%,25%)]"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t.login.password}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none transition-all bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-600 focus:border-[hsl(205,45%,25%)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-white text-sm mt-1 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'hsl(205,45%,25%)' }}
            >
              {loading ? t.login.submitting : t.login.submit}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-6">
          © {new Date().getFullYear()} {t.nav.brandName}. {t.login.copyright}
        </p>
      </div>
    </div>
  );
}
