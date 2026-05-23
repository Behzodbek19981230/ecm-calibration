import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileX, User, Building2, X, ClipboardCopy, Check, ExternalLink } from 'lucide-react';
import api from '../lib/api';

interface RejectionLetter {
  id: number;
  applicationId: number;
  reason: string;
  letterText: string;
  createdAt: string;
  application: {
    id: number;
    userType: string;
    fullName?: string;
    orgName?: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  createdBy: {
    id: number;
    fullName: string;
    username: string;
  };
}

function LetterModal({ letter, onClose }: { letter: RejectionLetter; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyText() {
    navigator.clipboard.writeText(letter.letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const applicantName = letter.application.userType === 'individual'
    ? (letter.application.fullName ?? letter.application.email)
    : (letter.application.orgName ?? letter.application.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <FileX size={18} className="text-red-500" />
            <div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Bekor qilish xati</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500">Ariza №{letter.applicationId} — {applicantName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-5">
            <pre className="text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
              {letter.letterText}
            </pre>
          </div>
        </div>

        <div className="px-5 pb-5 flex items-center justify-between shrink-0 border-t border-gray-100 dark:border-slate-700 pt-4">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Shakllangan: {new Date(letter.createdAt).toLocaleString('uz-UZ')}
            {letter.createdBy?.fullName && ` · ${letter.createdBy.fullName}`}
          </p>
          <button
            onClick={copyText}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <ClipboardCopy size={14} />}
            {copied ? 'Nusxalandi!' : 'Nusxalash'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RejectionLetters() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RejectionLetter | null>(null);

  const { data: letters = [], isLoading } = useQuery<RejectionLetter[]>({
    queryKey: ['rejection-letters'],
    queryFn: () => api.get('/rejection-letters').then((r) => r.data),
  });

  if (isLoading) return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(205,45%,35%)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <>
      {selected && <LetterModal letter={selected} onClose={() => setSelected(null)} />}

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
            <FileX size={20} className="text-red-500" />
            Bekor qilish xatlari
          </h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{letters.length} ta xat</p>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                  {['№', 'Ariza', 'Arizachi', 'Sabab', 'Sana', 'Amallar'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {letters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 dark:text-slate-500">
                      <FileX size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Hozircha bekor qilish xatlari yo'q</p>
                    </td>
                  </tr>
                ) : letters.map((letter) => {
                  const applicantName = letter.application.userType === 'individual'
                    ? (letter.application.fullName ?? '—')
                    : (letter.application.orgName ?? '—');

                  return (
                    <tr key={letter.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 dark:text-slate-500 text-xs font-mono">#{letter.id}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate(`/applications/${letter.applicationId}`)}
                          className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          #{letter.applicationId}
                          <ExternalLink size={10} />
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            {letter.application.userType === 'individual'
                              ? <User size={11} className="text-gray-500 dark:text-slate-400" />
                              : <Building2 size={11} className="text-gray-500 dark:text-slate-400" />}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-slate-100 text-xs leading-tight">{applicantName}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{letter.application.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 max-w-[220px]">{letter.reason}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(letter.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelected(letter)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <FileX size={12} />
                          Ko'rish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
