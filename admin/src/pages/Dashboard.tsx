import type { ReactNode } from 'react';
import {
  ClipboardList, Users, Award, ShieldCheck, Mail, TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useDashboardStats } from '../services/statsService';
import { useContacts } from '../services/contactService';
import { useLang } from '../lib/LangContext';
import { useTheme } from '../lib/ThemeContext';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  bg: string;
  iconColor: string;
}

function StatCard({ icon, label, value, bg, iconColor }: StatCardProps) {
  return (
    <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all hover:-translate-y-0.5 group cursor-default'>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${bg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className='text-2xl font-bold text-gray-800 dark:text-slate-100 mb-0.5 tabular-nums'>{value.toLocaleString()}</p>
      <p className='text-xs text-gray-500 dark:text-slate-400'>{label}</p>
    </div>
  );
}

function formatMonth(key: string) {
  return new Date(key + '-01').toLocaleDateString('uz-UZ', { month: 'short', year: '2-digit' });
}

export default function Dashboard() {
  const { t } = useLang();
  const { theme } = useTheme();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: contacts = [] } = useContacts();

  const isLoading = statsLoading;
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

  const pieData = stats
    ? [
        { name: t.status.new,        value: stats.applications.new,        fill: '#3b82f6' },
        { name: t.status.contract,   value: stats.applications.contract,   fill: '#a855f7' },
        { name: t.status.acceptance, value: stats.applications.acceptance, fill: '#f59e0b' },
        { name: t.status.laboratory, value: stats.applications.laboratory, fill: '#14b8a6' },
        { name: t.status.completed,  value: stats.applications.completed,  fill: '#22c55e' },
      ].filter((d) => d.value > 0)
    : [];

  const barData = stats?.applications.perMonth.map((m) => ({
    month: formatMonth(m.month),
    [t.nav.applications]: m.count,
  })) ?? [];

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>{t.dashboard.title}</h1>
        <p className='text-sm text-gray-400 dark:text-slate-500 mt-0.5'>{t.dashboard.subtitle}</p>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='bg-white dark:bg-slate-800 rounded-2xl p-5 h-28 animate-pulse border border-gray-100 dark:border-slate-700' />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8'>
            <StatCard icon={<ClipboardList size={18} />} label={t.dashboard.totalApps}   value={stats.applications.total}   bg='bg-blue-50 dark:bg-blue-950'       iconColor='text-blue-600' />
            <StatCard icon={<Users size={18} />}         label={t.dashboard.usersCount}  value={stats.users.total}          bg='bg-purple-50 dark:bg-purple-950'   iconColor='text-purple-600' />
            <StatCard icon={<Award size={18} />}         label={t.dashboard.certs}       value={stats.certificates.total}   bg='bg-teal-50 dark:bg-teal-950'       iconColor='text-teal-600' />
            <StatCard icon={<ShieldCheck size={18} />}   label={t.dashboard.activeCerts} value={stats.certificates.active}  bg='bg-emerald-50 dark:bg-emerald-950' iconColor='text-emerald-600' />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8'>
            <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center'>
                  <ClipboardList size={15} className='text-blue-500' />
                </div>
                <h2 className='font-semibold text-gray-700 dark:text-slate-200 text-sm'>{t.dashboard.statusChart}</h2>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width='100%' height={220}>
                  <PieChart>
                    <Pie data={pieData} cx='50%' cy='50%' innerRadius={55} outerRadius={85} paddingAngle={3} dataKey='value'>
                      {pieData.map((e, i) => <Cell key={i} fill={e.fill} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} ta`, '']} contentStyle={tooltipStyle} />
                    <Legend iconType='circle' iconSize={8} wrapperStyle={{ fontSize: 12, color: axisColor }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='h-[220px] flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-slate-600'>
                  <ClipboardList size={32} />
                  <p className='text-sm'>{t.dashboard.noApps}</p>
                </div>
              )}
            </div>

            <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center'>
                  <TrendingUp size={15} className='text-green-500' />
                </div>
                <h2 className='font-semibold text-gray-700 dark:text-slate-200 text-sm'>{t.dashboard.monthlyChart}</h2>
              </div>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={barData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke={gridColor} vertical={false} />
                  <XAxis dataKey='month' tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} />
                  <Bar dataKey={t.nav.applications} fill='hsl(205,45%,35%)' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}

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
                  <p className={`text-sm ${c.isRead ? 'text-gray-700 dark:text-slate-300' : 'font-semibold text-gray-800 dark:text-slate-100'}`}>{c.name}</p>
                  {c.company && <span className='text-xs text-gray-400 dark:text-slate-500'>— {c.company}</span>}
                </div>
                <p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-xs'>{c.message}</p>
              </div>
              <p className='text-xs text-gray-400 dark:text-slate-500 shrink-0 mt-0.5'>
                {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
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
