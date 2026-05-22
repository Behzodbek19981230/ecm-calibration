import { useEffect, useState } from 'react';
import {
  Eye, FileText, Send, ChevronDown, User, Building2,
  Mail, MessageCircle, Paperclip, Clock, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import api from '../lib/api';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colorMap: Record<string, string> = {
    kutilmoqda:    'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-900',
    jarayonda:     'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    bajarildi:     'text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900',
    bekor_qilindi: 'text-red-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorMap[status] ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
      {status === 'kutilmoqda'    && <Clock size={11} />}
      {status === 'jarayonda'     && <Loader2 size={11} className="animate-spin" />}
      {status === 'bajarildi'     && <CheckCircle size={11} />}
      {status === 'bekor_qilindi' && <XCircle size={11} />}
      {labels[status] ?? status}
    </span>
  );
}

export default function Applications() {
  const { t } = useLang();
  const a = t.applications;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  const statusOptions = [
    { value: 'kutilmoqda',    label: t.status.kutilmoqda },
    { value: 'jarayonda',     label: t.status.jarayonda },
    { value: 'bajarildi',     label: t.status.bajarildi },
    { value: 'bekor_qilindi', label: t.status.bekor_qilindi },
  ];

  function fetchAll() {
    api.get('/applications').then((r) => setApplications(r.data)).finally(() => setLoading(false));
  }
  useEffect(() => { fetchAll(); }, []);

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    try {
      const { data } = await api.patch(`/applications/${id}/status`, { status });
      setApplications((p) => p.map((x) => x.id === id ? { ...x, status: data.status } : x));
      if (selected?.id === id) setSelected((p) => p ? { ...p, status: data.status } : p);
    } finally { setUpdatingId(null); }
  }

  async function sendNotify(id: number) {
    setNotifyingId(id);
    try {
      await api.post(`/applications/${id}/notify`);
      alert(a.notifySent);
    } catch {
      alert(a.notifyError);
    } finally { setNotifyingId(null); }
  }

  const total   = applications.length;
  const pending = applications.filter((x) => x.status === 'kutilmoqda').length;
  const done    = applications.filter((x) => x.status === 'bajarildi').length;

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(205,45%,35%)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{a.title}</h1>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{a.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[
          { label: a.total,   value: total,   color: 'text-gray-700 dark:text-slate-200' },
          { label: a.pending, value: pending, color: 'text-yellow-600' },
          { label: a.done,    value: done,    color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                    {[a.cols.id, a.cols.applicant, a.cols.contact, a.cols.notify, a.cols.status, a.cols.actions].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 dark:text-slate-500">
                        <FileText size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{a.noApps}</p>
                      </td>
                    </tr>
                  ) : applications.map((app) => (
                    <tr
                      key={app.id}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${selected?.id === app.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                      onClick={() => setSelected(app.id === selected?.id ? null : app)}
                    >
                      <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs font-mono">#{app.id}</td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700 dark:text-slate-300">{app.phone}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[140px]">{app.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${app.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-500 dark:text-slate-400'}`}>
                          {app.notifyMethod === 'telegram'
                            ? <><MessageCircle size={12} /> Telegram</>
                            : <><Mail size={12} /> Email</>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} labels={t.status as Record<string,string>} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <select
                              value={app.status}
                              disabled={updatingId === app.id}
                              onChange={(e) => updateStatus(app.id, e.target.value)}
                              className="appearance-none pl-2 pr-6 py-1 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer focus:outline-none disabled:opacity-50"
                            >
                              {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => sendNotify(app.id)}
                            disabled={notifyingId === app.id}
                            title={a.sendNotify}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors disabled:opacity-50"
                          >
                            {notifyingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                          <button
                            onClick={() => setSelected(app.id === selected?.id ? null : app)}
                            title={a.viewDetail}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-80 shrink-0">
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{a.appNum}{selected.id}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-lg leading-none">×</button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{a.detailApplicant}</p>
                  <p className="font-medium text-gray-800 dark:text-slate-100">
                    {selected.userType === 'individual' ? selected.fullName : selected.orgName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {selected.userType === 'individual' ? a.individual : a.legal}
                    {selected.branchRequest && ` ${a.branch}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{a.detailContact}</p>
                  <p className="text-gray-700 dark:text-slate-200">{selected.phone}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{a.detailNotify}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${selected.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-600 dark:text-slate-300'}`}>
                    {selected.notifyMethod === 'telegram'
                      ? <><MessageCircle size={12} /> Telegram</>
                      : <><Mail size={12} /> Email</>}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{t.common.status}</p>
                  <StatusBadge status={selected.status} labels={t.status as Record<string,string>} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1.5">
                    {a.detailDevices} ({(selected.devices as unknown[]).length})
                  </p>
                  <div className="space-y-1.5">
                    {(selected.devices as {type:string;serialNumber?:string;measureRange?:string}[]).map((d, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 text-xs">
                        <p className="font-medium text-gray-700 dark:text-slate-200">{d.type}</p>
                        {d.serialNumber && <p className="text-gray-400 dark:text-slate-500">№ {d.serialNumber}</p>}
                        {d.measureRange && <p className="text-gray-400 dark:text-slate-500">{d.measureRange}</p>}
                      </div>
                    ))}
                    {(selected.devices as unknown[]).length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-slate-500">{a.noDevices}</p>
                    )}
                  </div>
                </div>
                {selected.filePath && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{a.detailAttach}</p>
                    <a
                      href={`${API_URL}/uploads/${selected.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                      style={{ color: 'hsl(205,45%,30%)' }}
                    >
                      <Paperclip size={12} />
                      {a.viewFile}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{a.submittedAt}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    {new Date(selected.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <button
                  onClick={() => sendNotify(selected.id)}
                  disabled={notifyingId === selected.id}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 mt-2 hover:opacity-90"
                  style={{ background: 'hsl(205,45%,25%)' }}
                >
                  {notifyingId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {a.sendNotify}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
