import { useEffect, useState, useRef } from 'react';
import { Award, Plus, X, ExternalLink, ShieldOff, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import { hasRole } from '../lib/auth';
import type { Certificate, Application } from '../lib/types';
import { useLang } from '../lib/LangContext';

function applicantName(app: Application) {
  return app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);
}

export default function Certificates() {
  const { t } = useLang();
  const c = t.certificates;
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [completedApps, setCompletedApps] = useState<Application[]>([]);
  const [form, setForm] = useState({ applicationId: '', expiresAt: '', notes: '' });
  const [fileRef, setFileRef] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const canManage = hasRole('admin', 'manager');

  function fetchCerts() { return api.get('/certificates').then((r) => setCerts(r.data)); }
  useEffect(() => { fetchCerts().finally(() => setLoading(false)); }, []);

  async function openModal() {
    const { data } = await api.get('/applications');
    setCompletedApps((data as Application[]).filter((a) => a.status === 'bajarildi' && !a.certificate));
    setForm({ applicationId: '', expiresAt: '', notes: '' });
    setFileRef(null); setError(''); setShowModal(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.applicationId || !form.expiresAt) { setError(c.validate); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('applicationId', form.applicationId);
      fd.append('expiresAt', form.expiresAt);
      if (form.notes) fd.append('notes', form.notes);
      if (fileRef) fd.append('file', fileRef);
      await api.post('/certificates', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchCerts(); setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? t.common.error);
    } finally { setSubmitting(false); }
  }

  async function handleRevoke(id: number) {
    if (!confirm(c.confirmRevoke)) return;
    await api.patch(`/certificates/${id}`, { status: 'revoked' });
    await fetchCerts();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{c.title}</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{certs.length} {c.subtitle}</p>
        </div>
        {canManage && (
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: 'hsl(205,45%,25%)' }}>
            <Plus size={16} />
            {c.createNew}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl h-14 animate-pulse border border-gray-100 dark:border-slate-700" />)}
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-gray-100 dark:border-slate-700">
          <Award size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 text-sm">{c.noCerts}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  {[c.cols.number, c.cols.owner, c.cols.issued, c.cols.expires, c.cols.status, c.cols.issuedBy, ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {certs.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold" style={{ color: 'hsl(205,45%,25%)' }}>{cert.certNumber}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-slate-200">
                      {cert.application ? applicantName(cert.application) : `Ariza #${cert.applicationId}`}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-slate-400">{new Date(cert.issuedAt).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-slate-400">{new Date(cert.expiresAt).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cert.status === 'active' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 line-through'}`}>
                        {cert.status === 'active' ? c.active : c.revoked}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-slate-400">{cert.issuedBy?.fullName || cert.issuedBy?.username || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {cert.filePath && (
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000'}/uploads/${cert.filePath}`}
                            target="_blank" rel="noreferrer"
                            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all"
                            title={c.viewFile}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {canManage && cert.status === 'active' && (
                          <button onClick={() => handleRevoke(cert.id)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all" title={c.revoke}>
                            <ShieldOff size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">{c.createNew}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 rounded">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  {c.selectApp} <span className="text-red-500">{t.common.required}</span>
                </label>
                <div className="relative">
                  <select
                    value={form.applicationId}
                    onChange={(e) => setForm((p) => ({ ...p, applicationId: e.target.value }))}
                    className="w-full appearance-none px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:border-[hsl(205,45%,25%)]"
                  >
                    <option value="">{t.common.select}</option>
                    {completedApps.map((a) => <option key={a.id} value={a.id}>#{a.id} — {applicantName(a)}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {completedApps.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{c.noApps}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  {c.expiresAt} <span className="text-red-500">{t.common.required}</span>
                </label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:border-[hsl(205,45%,25%)]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{c.notes}</label>
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:border-[hsl(205,45%,25%)] resize-none"
                  placeholder={t.common.optional} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{c.file}</label>
                <input ref={fileInput} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFileRef(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-slate-700 file:text-gray-700 dark:file:text-slate-300 hover:file:bg-gray-200 dark:hover:file:bg-slate-600" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                  {t.common.cancel}
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90" style={{ background: 'hsl(205,45%,25%)' }}>
                  {submitting ? t.common.creating : t.common.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
