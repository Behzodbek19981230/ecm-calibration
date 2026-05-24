import type { ReactNode } from 'react';
import {
  ClipboardList, Users, Award, ShieldCheck, Mail, TrendingUp,
  Clock, FileCheck, Loader2, FlaskConical, CheckCircle, XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useDashboardStats } from '../services/statsService';
import { useContacts } from '../services/contactService';
import { useLang } from '../lib/LangContext';
import { useTheme } from '../lib/ThemeContext';

// ── helpers ──────────────────────────────────────────────────────

const LOCALE_MAP: Record<string, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

function formatMonth(key: string, lang: string): string {
  const locale = LOCALE_MAP[lang] ?? 'uz-UZ';
  return new Date(key + '-01').toLocaleDateString(locale, { month: 'short', year: '2-digit' });
}

// ── StatCard ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  sub?: string;
  bg: string;
  iconColor: string;
}

function StatCard({ icon, label, value, sub, bg, iconColor }: StatCardProps) {
  return (
    <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all hover:-translate-y-0.5 group cursor-default'>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${bg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className='text-2xl font-bold text-gray-800 dark:text-slate-100 mb-0.5 tabular-nums'>{value.toLocaleString()}</p>
      <p className='text-xs text-gray-500 dark:text-slate-400'>{label}</p>
      {sub && <p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5'>{sub}</p>}
    </div>
  );
}

// ── StatusCard ───────────────────────────────────────────────────

interface StatusCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  colorCls: string;
  bgCls: string;
  borderCls: string;
}

function StatusCard({ icon, label, value, colorCls, bgCls, borderCls }: StatusCardProps) {
  return (
    <div className={`rounded-xl px-4 py-3.5 border flex items-center gap-3 ${bgCls} ${borderCls}`}>
      <span className={`shrink-0 ${colorCls}`}>{icon}</span>
      <div className='min-w-0'>
        <p className={`text-lg font-bold tabular-nums leading-tight ${colorCls}`}>{value.toLocaleString()}</p>
        <p className='text-xs text-gray-500 dark:text-slate-400 truncate'>{label}</p>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────

export default function Dashboard() {
  const { t, lang } = useLang();
  const { theme } = useTheme();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: contacts = [] } = useContacts();

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipStyle = {
    borderRadius: '10px',
    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
    background: isDark ? '#1e293b' : '#fff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    fontSize: 12,
  };

  const totalMessages = contacts.length;
  const unreadCount   = contacts.filter((c) => !c.isRead).length;

  const pieData = stats
    ? [
        { name: t.status.new,        value: stats.applications.new,        fill: '#3b82f6' },
        { name: t.status.contract,   value: stats.applications.contract,   fill: '#a855f7' },
        { name: t.status.acceptance, value: stats.applications.acceptance, fill: '#f59e0b' },
        { name: t.status.laboratory, value: stats.applications.laboratory, fill: '#14b8a6' },
        { name: t.status.completed,  value: stats.applications.completed,  fill: '#22c55e' },
        { name: t.status.rejected,   value: stats.applications.rejected,   fill: '#ef4444' },
      ].filter((d) => d.value > 0)
    : [];

  const barData = stats?.applications.perMonth.map((m) => ({
    month: formatMonth(m.month, lang),
    count: m.count,
  })) ?? [];

  // unread sub-label
  const unreadSub = unreadCount > 0
    ? `${unreadCount} ${t.contacts.unread}`
    : t.contacts.allRead;

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>{t.dashboard.title}</h1>
        <p className='text-sm text-gray-400 dark:text-slate-500 mt-0.5'>{t.dashboard.subtitle}</p>
      </div>

      {statsLoading ? (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='bg-white dark:bg-slate-800 rounded-2xl p-5 h-28 animate-pulse border border-gray-100 dark:border-slate-700' />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* ── Primary stat cards ── */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4'>
            <StatCard
              icon={<ClipboardList size={18} />}
              label={t.dashboard.totalApps}
              value={stats.applications.total}
              bg='bg-blue-50 dark:bg-blue-950'
              iconColor='text-blue-600'
            />
            <StatCard
              icon={<Users size={18} />}
              label={t.dashboard.usersCount}
              value={stats.users.total}
              bg='bg-purple-50 dark:bg-purple-950'
              iconColor='text-purple-600'
            />
            <StatCard
              icon={<ShieldCheck size={18} />}
              label={t.dashboard.activeCerts}
              value={stats.certificates.active}
              sub={`${t.dashboard.certs}: ${stats.certificates.total}`}
              bg='bg-emerald-50 dark:bg-emerald-950'
              iconColor='text-emerald-600'
            />
            <StatCard
              icon={<Mail size={18} />}
              label={t.contacts.title}
              value={totalMessages}
              sub={unreadSub}
              bg='bg-amber-50 dark:bg-amber-950'
              iconColor='text-amber-600'
            />
          </div>

          {/* ── Status breakdown ── */}
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8'>
            <StatusCard
              icon={<Clock size={15} />}
              label={t.status.new}
              value={stats.applications.new}
              colorCls='text-blue-600'
              bgCls='bg-blue-50 dark:bg-blue-950/50'
              borderCls='border-blue-200 dark:border-blue-900'
            />
            <StatusCard
              icon={<FileCheck size={15} />}
              label={t.status.contract}
              value={stats.applications.contract}
              colorCls='text-purple-600'
              bgCls='bg-purple-50 dark:bg-purple-950/50'
              borderCls='border-purple-200 dark:border-purple-900'
            />
            <StatusCard
              icon={<Loader2 size={15} />}
              label={t.status.acceptance}
              value={stats.applications.acceptance}
              colorCls='text-amber-600'
              bgCls='bg-amber-50 dark:bg-amber-950/50'
              borderCls='border-amber-200 dark:border-amber-900'
            />
            <StatusCard
              icon={<FlaskConical size={15} />}
              label={t.status.laboratory}
              value={stats.applications.laboratory}
              colorCls='text-teal-600'
              bgCls='bg-teal-50 dark:bg-teal-950/50'
              borderCls='border-teal-200 dark:border-teal-900'
            />
            <StatusCard
              icon={<CheckCircle size={15} />}
              label={t.status.completed}
              value={stats.applications.completed}
              colorCls='text-green-600'
              bgCls='bg-green-50 dark:bg-green-950/50'
              borderCls='border-green-200 dark:border-green-900'
            />
            <StatusCard
              icon={<XCircle size={15} />}
              label={t.status.rejected}
              value={stats.applications.rejected}
              colorCls='text-red-600'
              bgCls='bg-red-50 dark:bg-red-950/50'
              borderCls='border-red-200 dark:border-red-900'
            />
          </div>

          {/* ── Charts ── */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8'>

            {/* Pie: status distribution */}
            <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center'>
                  <ClipboardList size={15} className='text-blue-500' />
                </div>
                <h2 className='font-semibold text-gray-700 dark:text-slate-200 text-sm'>{t.dashboard.statusChart}</h2>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width='100%' height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='48%'
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey='value'
                    >
                      {pieData.map((e, i) => <Cell key={i} fill={e.fill} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v, name) => [v, name]}
                    />
                    <Legend
                      iconType='circle'
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, color: axisColor, paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='h-[240px] flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-slate-600'>
                  <ClipboardList size={32} />
                  <p className='text-sm'>{t.dashboard.noApps}</p>
                </div>
              )}
            </div>

            {/* Bar: monthly applications */}
            <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center'>
                  <TrendingUp size={15} className='text-green-500' />
                </div>
                <h2 className='font-semibold text-gray-700 dark:text-slate-200 text-sm'>{t.dashboard.monthlyChart}</h2>
              </div>
              <ResponsiveContainer width='100%' height={240}>
                <BarChart data={barData} margin={{ top: 4, right: 5, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey='month'
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: axisColor }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
                    formatter={(v) => [v, t.nav.applications]}
                    labelStyle={{ color: axisColor, fontWeight: 600, marginBottom: 4 }}
                  />
                  <Bar
                    dataKey='count'
                    name={t.nav.applications}
                    fill='hsl(205,45%,35%)'
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}

      {/* ── Recent messages ── */}
      <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
        <div className='flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700'>
          <div className='flex items-center gap-2'>
            <Mail size={15} className='text-gray-400 dark:text-slate-500' />
            <h2 className='font-semibold text-gray-700 dark:text-slate-200 text-sm'>{t.dashboard.recentMessages}</h2>
          </div>
          {unreadCount > 0 && (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'>
              {unreadCount} {t.dashboard.newMessages}
            </span>
          )}
        </div>
        <div className='divide-y divide-gray-50 dark:divide-slate-700'>
          {contacts.slice(0, 5).map((c) => (
            <div key={c.id} className='flex items-start gap-4 px-5 sm:px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${c.isRead ? 'bg-gray-200 dark:bg-slate-600' : 'bg-amber-400'}`} />
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <p className={`text-sm ${c.isRead ? 'text-gray-700 dark:text-slate-300' : 'font-semibold text-gray-800 dark:text-slate-100'}`}>
                    {c.name}
                  </p>
                  {c.company && <span className='text-xs text-gray-400 dark:text-slate-500'>— {c.company}</span>}
                </div>
                <p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-xs'>{c.message}</p>
              </div>
              <p className='text-xs text-gray-400 dark:text-slate-500 shrink-0 mt-0.5'>
                {new Date(c.createdAt).toLocaleDateString(LOCALE_MAP[lang] ?? 'uz-UZ')}
              </p>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className='flex flex-col items-center justify-center py-12 gap-2 text-gray-300 dark:text-slate-600'>
              <Mail size={28} />
              <p className='text-sm'>{t.dashboard.noMessages}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
