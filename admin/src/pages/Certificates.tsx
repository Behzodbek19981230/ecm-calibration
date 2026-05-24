import { Award, ExternalLink, ShieldOff } from 'lucide-react';
import { useCertificates, useRevokeCertificate } from '../services/certificateService';
import { hasRole } from '../lib/auth';
import type { Application } from '../lib/types';
import { useLang } from '../lib/LangContext';

const LOCALE_MAP: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

function applicantName(app: Application) {
  return app.userType === 'individual' ? (app.fullName ?? app.email) : (app.orgName ?? app.email);
}

export default function Certificates() {
  const { t, lang } = useLang();
  const c = t.certificates;
  const locale = LOCALE_MAP[lang] ?? 'uz-UZ';
  const canManage = hasRole('admin', 'manager');

  const { data: certs = [], isLoading } = useCertificates();
  const revokeCert = useRevokeCertificate();

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
            <table className='w-full text-sm min-w-[800px]'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50'>
                  {[c.cols.number, c.cols.owner, c.cols.deviceName, c.cols.serialNumber, c.cols.issued, c.cols.expires, c.cols.status, c.cols.issuedBy, ''].map((h, i) => (
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
                      {cert.application ? applicantName(cert.application) : `${c.appRef}${cert.applicationId}`}
                    </td>
                    <td className='px-5 py-3 text-gray-700 dark:text-slate-200'>{cert.deviceName ?? '—'}</td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400 font-mono text-xs'>{cert.serialNumber ?? '—'}</td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>{new Date(cert.issuedAt).toLocaleDateString(locale)}</td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>
                      {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString(locale) : '—'}
                    </td>
                    <td className='px-5 py-3'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cert.status === 'active' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 line-through'}`}>
                        {cert.status === 'active' ? c.active : c.revoked}
                      </span>
                    </td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>{cert.issuedBy?.fullName || cert.issuedBy?.username || '—'}</td>
                    <td className='px-5 py-3'>
                      <div className='flex items-center gap-2 justify-end'>
                        {(cert.filePath || cert.url) && (
                          <a
                            href={cert.url || `${import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000'}/uploads/${cert.filePath}`}
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
    </div>
  );
}
