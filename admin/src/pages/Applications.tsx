import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, User, Building2, Mail, MessageCircle, Clock, CheckCircle, Loader2, FileCheck, FlaskConical } from 'lucide-react';
import api from '../lib/api';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';

const STATUS_COLORS: Record<string, string> = {
  new:        'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  contract:   'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
  acceptance: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
  laboratory: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900',
  completed:  'text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'new')        return <Clock size={11} />;
  if (status === 'contract')   return <FileCheck size={11} />;
  if (status === 'acceptance') return <Loader2 size={11} className="animate-spin" />;
  if (status === 'laboratory') return <FlaskConical size={11} />;
  if (status === 'completed')  return <CheckCircle size={11} />;
  return null;
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
      <StatusIcon status={status} />
      {label}
    </span>
  );
}

export default function Applications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const a = t.applications;

  const activeStatus = searchParams.get('status') ?? '';

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/applications').then((r) => setApplications(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = activeStatus
    ? applications.filter((x) => x.status === activeStatus)
    : applications;

  const counts = ['new', 'contract', 'acceptance', 'laboratory', 'completed'].reduce<Record<string, number>>(
    (acc, s) => { acc[s] = applications.filter((x) => x.status === s).length; return acc; },
    {},
  );

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(205,45%,35%)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">
          {activeStatus ? t.status[activeStatus as keyof typeof t.status] : a.title}
        </h1>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
          {filtered.length} {a.subtitle.toLowerCase()}
        </p>
      </div>

      {/* Status summary chips */}
      {!activeStatus && (
        <div className="flex flex-wrap gap-2 mb-5">
          {(['new', 'contract', 'acceptance', 'laboratory', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => navigate(`/applications?status=${s}`)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm ${STATUS_COLORS[s]}`}
            >
              <StatusIcon status={s} />
              {t.status[s]}
              <span className="ml-0.5 font-bold">{counts[s]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                {[a.cols.id, a.cols.applicant, a.cols.contact, a.cols.notify, a.cols.status].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 dark:text-slate-500">
                    <FileText size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{a.noApps}</p>
                  </td>
                </tr>
              ) : filtered.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 text-gray-400 dark:text-slate-500 text-xs font-mono">#{app.id}</td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {app.userType === 'individual'
                          ? <User size={13} className="text-gray-500 dark:text-slate-400" />
                          : <Building2 size={13} className="text-gray-500 dark:text-slate-400" />}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-slate-100 text-xs leading-tight">
                          {app.userType === 'individual' ? (app.fullName || '—') : (app.orgName || '—')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {app.userType === 'individual' ? a.individual : a.legal}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-xs text-gray-700 dark:text-slate-300">{app.phone}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[140px]">{app.email}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${app.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-500 dark:text-slate-400'}`}>
                      {app.notifyMethod === 'telegram'
                        ? <><MessageCircle size={12} /> Telegram</>
                        : <><Mail size={12} /> Email</>}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge
                      status={app.status}
                      label={t.status[app.status as keyof typeof t.status] ?? app.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
