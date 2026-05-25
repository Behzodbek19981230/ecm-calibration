import { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, ChevronDown, ChevronRight, ScrollText, Search, X } from 'lucide-react';
import api from '../lib/api';
import { useLang } from '../lib/LangContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type LogLevel = 'all' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: number;
  level: string;
  message: string;
  meta: string | null;
  createdAt: string;
}

const LEVEL_STYLES: Record<string, string> = {
  info:  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  warn:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const LEVEL_DOT: Record<string, string> = {
  info:  'bg-sky-400',
  warn:  'bg-amber-400',
  error: 'bg-red-500',
};

const LIMIT = 50;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function MetaCell({ raw }: { raw: string | null }) {
  const [open, setOpen] = useState(false);
  if (!raw) return <span className='text-gray-300 dark:text-slate-600'>—</span>;
  let pretty: string;
  try { pretty = JSON.stringify(JSON.parse(raw), null, 2); } catch { pretty = raw; }
  return (
    <button
      onClick={() => setOpen((p) => !p)}
      className='flex items-start gap-1 text-left text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors max-w-xs'
    >
      {open ? <ChevronDown size={12} className='mt-0.5 shrink-0' /> : <ChevronRight size={12} className='mt-0.5 shrink-0' />}
      {open
        ? <pre className='whitespace-pre-wrap break-all font-mono'>{pretty}</pre>
        : <span className='truncate'>{raw.slice(0, 60)}{raw.length > 60 ? '…' : ''}</span>
      }
    </button>
  );
}

export default function Logs() {
  const { t, lang } = useLang();
  const l = t.logs;
  const qc = useQueryClient();

  const [level, setLevel] = useState<LogLevel>('all');
  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 350);
  const searchRef = useRef<HTMLInputElement>(null);

  // reset offset when filters change
  useEffect(() => { setOffset(0); }, [level, search]);

  const fetchLogs = useCallback(
    () => api.get<{ data: LogEntry[]; total: number }>('/logs', {
      params: {
        ...(level !== 'all' && { level }),
        ...(search && { search }),
        limit: LIMIT,
        offset,
      },
    }).then((r) => r.data),
    [level, search, offset],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['logs', level, search, offset],
    queryFn: fetchLogs,
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/logs'),
    onSuccess: () => {
      setOffset(0);
      qc.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  function handleLevelChange(v: LogLevel) {
    setLevel(v);
    setOffset(0);
  }

  function handleClear() {
    if (!confirm(l.confirmClear)) return;
    clearMutation.mutate();
  }

  const logs: LogEntry[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const hasMore = offset + LIMIT < total;

  const LEVEL_TABS: { key: LogLevel; label: string }[] = [
    { key: 'all',   label: l.all },
    { key: 'info',  label: l.info },
    { key: 'warn',  label: l.warn },
    { key: 'error', label: l.error },
  ];

  const LOCALE_MAP: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
  const locale = LOCALE_MAP[lang] ?? 'uz-UZ';

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-3 mb-5'>
        <div>
          <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>{l.title}</h1>
          <p className='text-sm text-gray-400 dark:text-slate-500 mt-0.5'>{total} {l.showing}</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => { setOffset(0); refetch(); }}
            disabled={isFetching}
            className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50'
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            {l.refresh}
          </button>
          <button
            onClick={handleClear}
            disabled={clearMutation.isPending || total === 0}
            className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all disabled:opacity-40'
          >
            <Trash2 size={14} />
            {l.clearAll}
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className='flex flex-wrap gap-2 mb-4'>
        {/* Level tabs */}
        <div className='flex gap-1'>
          {LEVEL_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleLevelChange(key)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                level === key
                  ? key === 'error' ? 'bg-red-600 text-white border-transparent'
                    : key === 'warn'  ? 'bg-amber-500 text-white border-transparent'
                    : key === 'info'  ? 'bg-sky-600 text-white border-transparent'
                    : 'text-white border-transparent'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700',
              ].join(' ')}
              style={level === key && key === 'all' ? { background: 'hsl(205,45%,25%)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className='relative flex-1 min-w-[180px] max-w-xs'>
          <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none' />
          <input
            ref={searchRef}
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={l.searchPlaceholder}
            className='w-full pl-8 pr-7 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[hsl(205,45%,25%)] transition-colors'
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); searchRef.current?.focus(); }}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors'
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
        {isLoading ? (
          <div className='p-8 text-center text-sm text-gray-400 dark:text-slate-500'>{t.common.loading}</div>
        ) : logs.length === 0 ? (
          <div className='p-12 text-center'>
            <ScrollText size={32} className='mx-auto text-gray-300 dark:text-slate-600 mb-3' />
            <p className='text-gray-400 dark:text-slate-500'>{l.noLogs}</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[620px]'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50'>
                  {[l.cols.level, l.cols.message, l.cols.meta, l.cols.time].map((h, i) => (
                    <th key={i} className='text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50 dark:divide-slate-700/60'>
                {logs.map((log) => (
                  <tr key={log.id} className='hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition-colors'>
                    <td className='px-5 py-3 whitespace-nowrap'>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${LEVEL_STYLES[log.level] ?? 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_DOT[log.level] ?? 'bg-gray-400'}`} />
                        {log.level}
                      </span>
                    </td>
                    <td className='px-5 py-3 text-sm text-gray-700 dark:text-slate-200 max-w-sm'>
                      <span className='break-all'>{log.message}</span>
                    </td>
                    <td className='px-5 py-3'>
                      <MetaCell raw={log.meta} />
                    </td>
                    <td className='px-5 py-3 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap'>
                      {new Date(log.createdAt).toLocaleString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className='mt-4 text-center'>
          <button
            onClick={() => setOffset((p) => p + LIMIT)}
            className='px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all'
          >
            {l.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
