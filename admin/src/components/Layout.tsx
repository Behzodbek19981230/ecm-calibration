import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Mail, MapPin, ClipboardList, Award,
  Users, LogOut, Menu, X, Sun, Moon,
} from 'lucide-react';
import { getRoles, logout } from '../lib/auth';
import { useLang } from '../lib/LangContext';
import { useTheme } from '../lib/ThemeContext';
import type { Lang } from '../lib/i18n';

const LANG_FLAGS: Record<Lang, string> = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
const LANGS: Lang[] = ['uz', 'ru', 'en'];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t, lang, setLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();

  const user = localStorage.getItem('ecm_user') || 'Admin';
  const fullName = localStorage.getItem('ecm_fullName') || user;
  const roles = getRoles();
  const roleLabel = roles[0]
    ? (t.roles[roles[0] as keyof typeof t.roles] ?? roles[0])
    : '';
  const initials = fullName
    .split(' ')
    .map((w: string) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const baseNavItems = [
    { to: '/dashboard',    icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/applications', icon: ClipboardList,    label: t.nav.applications },
    { to: '/certificates', icon: Award,            label: t.nav.certificates },
    { to: '/contacts',     icon: Mail,             label: t.nav.contacts },
    { to: '/regions',      icon: MapPin,           label: t.nav.regions },
  ];
  const navItems = roles.includes('admin')
    ? [...baseNavItems, { to: '/users', icon: Users, label: t.nav.users }]
    : baseNavItems;

  const pageTitle = navItems.find(n => location.pathname.startsWith(n.to))?.label
    ?? (location.pathname.startsWith('/blog') ? t.nav.blog : t.nav.dashboard);

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-slate-800
        border-r border-gray-200 dark:border-slate-700
        flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 h-14 px-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'hsl(205,45%,25%)' }}
          >
            <img src="/logo.png" alt="ECM" className="h-5 w-auto object-contain brightness-0 invert" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 dark:text-slate-100 leading-tight">{t.nav.brandName}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 leading-none mt-0.5">{t.nav.adminPanel}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            {t.nav.menu}
          </p>
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'font-semibold bg-[hsl(205_45%_25%_/_0.09)] text-[hsl(205,45%,20%)] dark:bg-primary dark:text-white dark:shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Lang switcher */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700">
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lang === l
                    ? 'text-white'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                style={lang === l ? { background: 'hsl(205,45%,25%)' } : {}}
                title={t.lang[l]}
              >
                {LANG_FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* User + Logout */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
              style={{ background: 'hsl(205,45%,25%)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate leading-tight">{fullName}</p>
              {roleLabel && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{roleLabel}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              title={t.nav.logout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top header */}
        <header className="h-14 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 px-4 sm:px-6 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-slate-500 hidden sm:block">{t.nav.breadcrumb}</span>
            <span className="text-gray-300 dark:text-slate-600 hidden sm:block">/</span>
            <h1 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{pageTitle}</h1>
          </div>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Avatar (mobile) */}
          <div
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'hsl(205,45%,25%)' }}
          >
            {initials}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
