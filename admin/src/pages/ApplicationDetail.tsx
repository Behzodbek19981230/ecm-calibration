import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Building2, Mail, MessageCircle,
  Paperclip, Clock, CheckCircle, Loader2, Send, FileCheck, FlaskConical,
  XCircle, ThumbsUp, ThumbsDown, X, FileX,
} from 'lucide-react';
import api from '../lib/api';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';
import { hasRole } from '../lib/auth';
import { useAcceptApplication, useRejectApplication } from '../services/applicationService';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
  new:        'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  contract:   'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
  acceptance: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
  laboratory: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900',
  completed:  'text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900',
  rejected:   'text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
};

function StatusIcon({ status, size = 12 }: { status: string; size?: number }) {
  if (status === 'new')        return <Clock size={size} />;
  if (status === 'contract')   return <FileCheck size={size} />;
  if (status === 'acceptance') return <Loader2 size={size} className="animate-spin" />;
  if (status === 'laboratory') return <FlaskConical size={size} />;
  if (status === 'completed')  return <CheckCircle size={size} />;
  if (status === 'rejected')   return <XCircle size={size} />;
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

function RejectModal({ onClose, onConfirm, loading }: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileX size={18} className="text-red-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Bekor qilish xatini shakllantirish</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Rad etish sababini kiriting. Bu matn arizachiga xat ko'rinishida yuboriladi.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Masalan: Taqdim etilgan qurilmalar ro'yxati to'liq emas. Iltimos, barcha asbob-uskunalar seriya raqamlari bilan qayta yuboring..."
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>
        <div className="px-5 pb-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FileX size={14} />}
            Xat shakllantirish va yuborish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLang();
  const a = t.applications;

  const isChiefLab = hasRole('chief_laboratory');
  const isAdmin    = hasRole('admin');
  const canDecide  = (isChiefLab || isAdmin);

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionDone, setActionDone] = useState<'accepted' | 'rejected' | null>(null);

  const acceptMutation  = useAcceptApplication();
  const rejectMutation  = useRejectApplication();

  const statusOptions = [
    { value: 'new',        label: t.status.new },
    { value: 'contract',   label: t.status.contract },
    { value: 'acceptance', label: t.status.acceptance },
    { value: 'laboratory', label: t.status.laboratory },
    { value: 'completed',  label: t.status.completed },
    { value: 'rejected',   label: t.status.rejected ?? 'Rad etilgan' },
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

  async function handleAccept() {
    if (!app) return;
    await acceptMutation.mutateAsync(app.id);
    setApp((p) => p ? { ...p, status: 'contract' } : p);
    setActionDone('accepted');
  }

  async function handleReject(reason: string) {
    if (!app) return;
    await rejectMutation.mutateAsync({ id: app.id, reason });
    setApp((p) => p ? { ...p, status: 'rejected' } : p);
    setShowRejectModal(false);
    setActionDone('rejected');
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
  const isNew = app.status === 'new';

  return (
    <>
      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          loading={rejectMutation.isPending}
        />
      )}

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

        {/* Action result banner */}
        {actionDone === 'accepted' && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 flex items-center gap-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle size={16} />
            Ariza qabul qilindi. Status "Shartnoma tuzish" ga o'tkazildi.
          </div>
        )}
        {actionDone === 'rejected' && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
            <XCircle size={16} />
            Ariza rad etildi. Bekor qilish xati shakllandi va arizachiga yuborildi.
          </div>
        )}

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

            {/* Chief laboratory: Accept / Reject for new applications */}
            {canDecide && isNew && !actionDone && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">Laboratoriya qarori</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
                  Yangi arizani qabul qiling yoki rad eting
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleAccept}
                    disabled={acceptMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    {acceptMutation.isPending
                      ? <Loader2 size={14} className="animate-spin" />
                      : <ThumbsUp size={14} />}
                    Qabul qilish
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={acceptMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    <ThumbsDown size={14} />
                    Rad etish
                  </button>
                </div>
              </div>
            )}

            {/* Rejected info */}
            {app.status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={15} className="text-red-500" />
                  <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Ariza rad etilgan</h2>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Bekor qilish xatini ko'rish uchun "Bekor qilish xatlari" bo'limiga o'ting.
                </p>
              </div>
            )}

            {/* Status change — only for non-chief_laboratory or non-new */}
            {(!canDecide || !isNew || actionDone) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">{t.common.status}</h2>
                <div className="space-y-1.5">
                  {statusOptions.map((opt) => {
                    const isActive = app.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        disabled={updating || canDecide}
                        onClick={() => !canDecide && updateStatus(opt.value)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          isActive
                            ? `${STATUS_COLORS[opt.value]} font-semibold`
                            : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                        } ${canDecide ? 'cursor-default' : ''}`}
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
            )}

            {/* Notify */}
            {!canDecide && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
