import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Building2, Mail, MessageCircle,
  Paperclip, Clock, CheckCircle, Loader2, Send, FileCheck, FlaskConical,
} from 'lucide-react';
import api from '../lib/api';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
  new:        'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  contract:   'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
  acceptance: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
  laboratory: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900',
  completed:  'text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900',
};

function StatusIcon({ status, size = 12 }: { status: string; size?: number }) {
  if (status === 'new')        return <Clock size={size} />;
  if (status === 'contract')   return <FileCheck size={size} />;
  if (status === 'acceptance') return <Loader2 size={size} className="animate-spin" />;
  if (status === 'laboratory') return <FlaskConical size={size} />;
  if (status === 'completed')  return <CheckCircle size={size} />;
  return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-gray-800 dark:text-slate-100">{children}</div>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLang();
  const a = t.applications;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);

  const statusOptions = [
    { value: 'new',        label: t.status.new },
    { value: 'contract',   label: t.status.contract },
    { value: 'acceptance', label: t.status.acceptance },
    { value: 'laboratory', label: t.status.laboratory },
    { value: 'completed',  label: t.status.completed },
  ];

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then((r) => setApp(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    if (!app) return;
    setUpdating(true);
    try {
      const { data } = await api.patch(`/applications/${app.id}/status`, { status });
      setApp((p) => p ? { ...p, status: data.status } : p);
    } finally {
      setUpdating(false);
    }
  }

  async function sendNotify() {
    if (!app) return;
    setNotifying(true);
    try {
      await api.post(`/applications/${app.id}/notify`);
      setNotifyDone(true);
      setTimeout(() => setNotifyDone(false), 3000);
    } finally {
      setNotifying(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(205,45%,35%)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!app) return (
    <div className="p-8 text-center text-gray-400 dark:text-slate-500">
      <p>Ariza topilmadi</p>
      <button onClick={() => navigate('/applications')} className="mt-3 text-sm underline">{a.title}</button>
    </div>
  );

  const devices = app.devices as { type: string; serialNumber?: string; measureRange?: string; accuracyClass?: string }[];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{a.appNum}{app.id}</h1>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {new Date(app.createdAt).toLocaleString('uz-UZ')}
          </p>
        </div>
        <div className="ml-auto">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[app.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            <StatusIcon status={app.status} />
            {t.status[app.status as keyof typeof t.status] ?? app.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: main info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Applicant */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950">
                {app.userType === 'individual'
                  ? <User size={14} className="text-blue-500" />
                  : <Building2 size={14} className="text-blue-500" />}
              </div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{a.detailApplicant}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={app.userType === 'individual' ? t.users.fullName : t.users.login}>
                {app.userType === 'individual' ? (app.fullName || '—') : (app.orgName || '—')}
              </Field>
              <Field label={t.common.status}>
                <span className="text-gray-500 dark:text-slate-400">
                  {app.userType === 'individual' ? a.individual : a.legal}
                  {app.branchRequest && <span className="ml-1 text-xs text-orange-500">{a.branch}</span>}
                </span>
              </Field>
              <Field label={t.contacts.cols.email}>
                <a href={`mailto:${app.email}`} className="hover:underline" style={{ color: 'hsl(205,45%,30%)' }}>{app.email}</a>
              </Field>
              <Field label={a.detailContact}>
                <a href={`tel:${app.phone}`} className="hover:underline text-gray-700 dark:text-slate-200">{app.phone}</a>
              </Field>
            </div>
          </div>

          {/* Notification method */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">{a.detailNotify}</h2>
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${app.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-600 dark:text-slate-300'}`}>
              {app.notifyMethod === 'telegram'
                ? <><MessageCircle size={15} /> Telegram</>
                : <><Mail size={15} /> Email — {app.email}</>}
            </span>
          </div>

          {/* Devices */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">
              {a.detailDevices}
              <span className="text-gray-400 dark:text-slate-500 font-normal ml-1">({devices.length})</span>
            </h2>
            {devices.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500">{a.noDevices}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {devices.map((d, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md text-[10px] font-bold text-white flex items-center justify-center shrink-0" style={{ background: 'hsl(205,45%,25%)' }}>{i + 1}</span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-tight">{d.type}</p>
                    </div>
                    <div className="pl-7 space-y-0.5">
                      {d.accuracyClass && <p className="text-xs text-gray-500 dark:text-slate-400">{d.accuracyClass}</p>}
                      {d.measureRange  && <p className="text-xs text-gray-500 dark:text-slate-400">{d.measureRange}</p>}
                      {d.serialNumber  && <p className="text-xs text-gray-500 dark:text-slate-400">№ {d.serialNumber}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached file */}
          {app.filePath && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{a.detailAttach}</h2>
              <a
                href={`${API_URL}/uploads/${app.filePath}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: 'hsl(205,45%,28%)' }}
              >
                <Paperclip size={14} />
                {a.viewFile}
              </a>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="space-y-4">

          {/* Status change */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">{t.common.status}</h2>
            <div className="space-y-1.5">
              {statusOptions.map((opt) => {
                const isActive = app.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    disabled={updating}
                    onClick={() => updateStatus(opt.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      isActive
                        ? `${STATUS_COLORS[opt.value]} font-semibold`
                        : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <StatusIcon status={opt.value} size={14} />
                    <span className="flex-1 text-left">{opt.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notify */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">{a.sendNotify}</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
              {app.notifyMethod === 'telegram' ? 'Telegram' : 'Email'} orqali yuboriladi
            </p>
            <button
              onClick={sendNotify}
              disabled={notifying || notifyDone}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: notifyDone ? '#16a34a' : 'hsl(205,45%,25%)' }}
            >
              {notifying
                ? <Loader2 size={15} className="animate-spin" />
                : notifyDone
                  ? <CheckCircle size={15} />
                  : <Send size={15} />}
              {notifying ? 'Yuborilmoqda...' : notifyDone ? 'Yuborildi!' : a.sendNotify}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
