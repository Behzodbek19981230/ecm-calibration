import { useRef, useState } from 'react';
import { Award, Plus, X, ExternalLink, ShieldOff, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCertificates, useCompletedApps, useCreateCertificate, useRevokeCertificate,
  certFormSchema, type CertFormValues,
} from '../services/certificateService';
import { hasRole } from '../lib/auth';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';

function applicantName(app: Application) {
  return app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);
}

const INPUT_CLS =
  'w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-[hsl(205,45%,25%)] bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100';

export default function Certificates() {
  const { t } = useLang();
  const c = t.certificates;
  const canManage = hasRole('admin', 'manager');

  const { data: certs = [], isLoading } = useCertificates();
  const { data: completedApps = [] } = useCompletedApps();
  const createCert = useCreateCertificate();
  const revokeCert = useRevokeCertificate();

  const [showModal, setShowModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CertFormValues>({
    resolver: zodResolver(certFormSchema),
    defaultValues: { applicationId: '', expiresAt: '', notes: '' },
  });

  function openModal() {
    reset({ applicationId: '', expiresAt: '', notes: '' });
    if (fileRef.current) fileRef.current.value = '';
    setShowModal(true);
  }

  async function onSubmit(data: CertFormValues) {
    const fd = new FormData();
    fd.append('applicationId', data.applicationId);
    fd.append('expiresAt', data.expiresAt);
    if (data.notes) fd.append('notes', data.notes);
    if (fileRef.current?.files?.[0]) fd.append('file', fileRef.current.files[0]);

    try {
      await createCert.mutateAsync(fd);
      setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError('root', { message: msg ?? t.common.error });
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm(c.confirmRevoke)) return;
    await revokeCert.mutateAsync(id);
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='flex items-center justify-between mb-6 sm:mb-8'>
        <div>
          <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>{c.title}</h1>
          <p className='text-sm text-gray-400 dark:text-slate-500 mt-0.5'>{certs.length} {c.subtitle}</p>
        </div>
        {canManage && (
          <button onClick={openModal} className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90' style={{ background: 'hsl(205,45%,25%)' }}>
            <Plus size={16} />
            {c.createNew}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='bg-white dark:bg-slate-800 rounded-xl h-14 animate-pulse border border-gray-100 dark:border-slate-700' />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className='bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-gray-100 dark:border-slate-700'>
          <Award size={40} className='text-gray-300 dark:text-slate-600 mx-auto mb-3' />
          <p className='text-gray-400 dark:text-slate-500 text-sm'>{c.noCerts}</p>
        </div>
      ) : (
        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm min-w-[700px]'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50'>
                  {[c.cols.number, c.cols.owner, c.cols.issued, c.cols.expires, c.cols.status, c.cols.issuedBy, ''].map((h, i) => (
                    <th key={i} className='text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50 dark:divide-slate-700'>
                {certs.map((cert) => (
                  <tr key={cert.id} className='hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'>
                    <td className='px-5 py-3'>
                      <span className='font-mono font-semibold' style={{ color: 'hsl(205,45%,25%)' }}>{cert.certNumber}</span>
                    </td>
                    <td className='px-5 py-3 text-gray-700 dark:text-slate-200'>
                      {cert.application ? applicantName(cert.application) : `Ariza #${cert.applicationId}`}
                    </td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>{new Date(cert.issuedAt).toLocaleDateString('uz-UZ')}</td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>{new Date(cert.expiresAt).toLocaleDateString('uz-UZ')}</td>
                    <td className='px-5 py-3'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cert.status === 'active' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 line-through'}`}>
                        {cert.status === 'active' ? c.active : c.revoked}
                      </span>
                    </td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>{cert.issuedBy?.fullName || cert.issuedBy?.username || '—'}</td>
                    <td className='px-5 py-3'>
                      <div className='flex items-center gap-2 justify-end'>
                        {cert.filePath && (
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000'}/uploads/${cert.filePath}`}
                            target='_blank' rel='noreferrer'
                            className='p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all'
                            title={c.viewFile}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {canManage && cert.status === 'active' && (
                          <button onClick={() => handleRevoke(cert.id)} className='p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all' title={c.revoke}>
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
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700'>
              <h3 className='font-semibold text-gray-800 dark:text-slate-100'>{c.createNew}</h3>
              <button onClick={() => setShowModal(false)} className='p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 rounded'>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
              {errors.root && (
                <div className='p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400'>
                  {errors.root.message}
                </div>
              )}

              {/* Application select */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>
                  {c.selectApp} <span className='text-red-500'>{t.common.required}</span>
                </label>
                <div className='relative'>
                  <select {...register('applicationId')} className={`${INPUT_CLS} appearance-none`}>
                    <option value=''>{t.common.select}</option>
                    {completedApps.map((a) => (
                      <option key={a.id} value={a.id}>#{a.id} — {applicantName(a)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
                </div>
                {completedApps.length === 0 && <p className='text-xs text-gray-400 dark:text-slate-500 mt-1'>{c.noApps}</p>}
                {errors.applicationId && <p className='text-red-500 text-xs mt-1'>{errors.applicationId.message}</p>}
              </div>

              {/* Expires at */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>
                  {c.expiresAt} <span className='text-red-500'>{t.common.required}</span>
                </label>
                <input {...register('expiresAt')} type='date' className={INPUT_CLS} />
                {errors.expiresAt && <p className='text-red-500 text-xs mt-1'>{errors.expiresAt.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>{c.notes}</label>
                <textarea {...register('notes')} rows={2} placeholder={t.common.optional}
                  className={`${INPUT_CLS} resize-none`} />
              </div>

              {/* File */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>{c.file}</label>
                <input ref={fileRef} type='file' accept='.pdf,.jpg,.jpeg,.png'
                  className='w-full text-sm text-gray-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-slate-700 file:text-gray-700 dark:file:text-slate-300 hover:file:bg-gray-200 dark:hover:file:bg-slate-600' />
              </div>

              <div className='flex gap-3 pt-2'>
                <button type='button' onClick={() => setShowModal(false)} className='flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all'>
                  {t.common.cancel}
                </button>
                <button type='submit' disabled={isSubmitting} className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90' style={{ background: 'hsl(205,45%,25%)' }}>
                  {isSubmitting ? t.common.creating : t.common.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
