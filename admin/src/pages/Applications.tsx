import { useEffect, useState } from 'react';
import {
  Eye, FileText, Send, ChevronDown, User, Building2,
  Mail, MessageCircle, Paperclip, Clock, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import api from '../lib/api';
import type { Application } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_OPTIONS = [
  { value: 'kutilmoqda', label: 'Kutilmoqda', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'jarayonda', label: 'Jarayonda', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'bajarildi', label: 'Bajarildi', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'bekor_qilindi', label: 'Bekor qilindi', color: 'text-red-500 bg-red-50 border-red-200' },
];

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${opt?.color ?? 'text-gray-500 bg-gray-50 border-gray-200'}`}>
      {status === 'kutilmoqda' && <Clock size={11} />}
      {status === 'jarayonda' && <Loader2 size={11} className='animate-spin' />}
      {status === 'bajarildi' && <CheckCircle size={11} />}
      {status === 'bekor_qilindi' && <XCircle size={11} />}
      {opt?.label ?? status}
    </span>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  function fetchAll() {
    api.get('/applications').then((r) => setApplications(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    try {
      const { data } = await api.patch(`/applications/${id}/status`, { status });
      setApplications((p) => p.map((a) => a.id === id ? { ...a, status: data.status } : a));
      if (selected?.id === id) setSelected((p) => p ? { ...p, status: data.status } : p);
    } finally {
      setUpdatingId(null);
    }
  }

  async function sendNotify(id: number) {
    setNotifyingId(id);
    try {
      await api.post(`/applications/${id}/notify`);
      alert("Bildirishnoma yuborildi!");
    } catch {
      alert("Yuborishda xatolik");
    } finally {
      setNotifyingId(null);
    }
  }

  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'kutilmoqda').length;
  const done = applications.filter((a) => a.status === 'bajarildi').length;

  if (loading) {
    return (
      <div className='p-8 flex items-center justify-center h-64'>
        <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Arizalar</h1>
        <p className='text-sm text-gray-500 mt-1'>Kelgan arizalarni boshqarish</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Jami', value: total, color: 'text-gray-700' },
          { label: 'Kutilmoqda', value: pending, color: 'text-yellow-600' },
          { label: 'Bajarildi', value: done, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className='rounded-xl border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500 mb-1'>{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className='flex gap-6'>
        {/* Table */}
        <div className='flex-1 min-w-0'>
          <div className='rounded-xl border border-gray-200 bg-white overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  {['#', 'Ariza beruvchi', 'Aloqa', 'Bildirishnoma', 'Holat', 'Amallar'].map((h) => (
                    <th key={h} className='px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center py-16 text-gray-400'>
                      <FileText size={36} className='mx-auto mb-2 opacity-30' />
                      <p className='text-sm'>Hech qanday ariza yo'q</p>
                    </td>
                  </tr>
                ) : applications.map((app) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.id === app.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelected(app.id === selected?.id ? null : app)}
                  >
                    <td className='px-4 py-3 text-gray-400 text-xs font-mono'>#{app.id}</td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <span className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0'>
                          {app.userType === 'individual'
                            ? <User size={13} className='text-gray-500' />
                            : <Building2 size={13} className='text-gray-500' />}
                        </span>
                        <div>
                          <p className='font-medium text-gray-800 text-xs leading-tight'>
                            {app.userType === 'individual' ? (app.fullName || '—') : (app.orgName || '—')}
                          </p>
                          <p className='text-xs text-gray-400'>
                            {app.userType === 'individual' ? 'Jismoniy shaxs' : 'Yuridik shaxs'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-xs text-gray-700'>{app.phone}</p>
                      <p className='text-xs text-gray-400 truncate max-w-[140px]'>{app.email}</p>
                    </td>
                    <td className='px-4 py-3'>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${app.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-500'}`}>
                        {app.notifyMethod === 'telegram'
                          ? <><MessageCircle size={12} /> Telegram</>
                          : <><Mail size={12} /> Email</>}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <StatusBadge status={app.status} />
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                        {/* Status select */}
                        <div className='relative'>
                          <select
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className='appearance-none pl-2 pr-6 py-1 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-blue-400 disabled:opacity-50'
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className='absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
                        </div>

                        {/* Notify */}
                        <button
                          onClick={() => sendNotify(app.id)}
                          disabled={notifyingId === app.id}
                          title='Bildirishnoma yuborish'
                          className='p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50'
                        >
                          {notifyingId === app.id
                            ? <Loader2 size={14} className='animate-spin' />
                            : <Send size={14} />}
                        </button>

                        {/* Detail */}
                        <button
                          onClick={() => setSelected(app.id === selected?.id ? null : app)}
                          title="Batafsil ko'rish"
                          className='p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors'
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

        {/* Detail panel */}
        {selected && (
          <div className='w-80 shrink-0'>
            <div className='rounded-xl border border-gray-200 bg-white p-5 sticky top-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-800 text-sm'>Ariza #{selected.id}</h3>
                <button onClick={() => setSelected(null)} className='text-gray-400 hover:text-gray-600 text-lg leading-none'>×</button>
              </div>

              <div className='space-y-3 text-sm'>
                <div>
                  <p className='text-xs text-gray-400 mb-0.5'>Ariza beruvchi</p>
                  <p className='font-medium text-gray-800'>
                    {selected.userType === 'individual' ? selected.fullName : selected.orgName}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {selected.userType === 'individual' ? 'Jismoniy shaxs' : 'Yuridik shaxs'}
                    {selected.branchRequest && ' · Filial'}
                  </p>
                </div>

                <div>
                  <p className='text-xs text-gray-400 mb-0.5'>Aloqa</p>
                  <p className='text-gray-700'>{selected.phone}</p>
                  <p className='text-gray-500 text-xs'>{selected.email}</p>
                </div>

                <div>
                  <p className='text-xs text-gray-400 mb-0.5'>Bildirishnoma</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${selected.notifyMethod === 'telegram' ? 'text-[#0088CC]' : 'text-gray-600'}`}>
                    {selected.notifyMethod === 'telegram'
                      ? <><MessageCircle size={12} /> Telegram</>
                      : <><Mail size={12} /> Email</>}
                  </span>
                </div>

                <div>
                  <p className='text-xs text-gray-400 mb-0.5'>Holat</p>
                  <StatusBadge status={selected.status} />
                </div>

                {/* Devices */}
                <div>
                  <p className='text-xs text-gray-400 mb-1.5'>
                    O'lchash vositalari ({(selected.devices as any[]).length} ta)
                  </p>
                  <div className='space-y-1.5'>
                    {(selected.devices as any[]).map((d, i) => (
                      <div key={i} className='px-3 py-2 rounded-lg bg-gray-50 text-xs'>
                        <p className='font-medium text-gray-700'>{d.type}</p>
                        {d.serialNumber && <p className='text-gray-400'>№ {d.serialNumber}</p>}
                        {d.measureRange && <p className='text-gray-400'>{d.measureRange}</p>}
                      </div>
                    ))}
                    {(selected.devices as any[]).length === 0 && (
                      <p className='text-xs text-gray-400'>Vosita yo'q</p>
                    )}
                  </div>
                </div>

                {/* File */}
                {selected.filePath && (
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Biriktirma fayl</p>
                    <a
                      href={`${API_URL}/uploads/${selected.filePath}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium'
                    >
                      <Paperclip size={12} />
                      Faylni ko'rish / yuklab olish
                    </a>
                  </div>
                )}

                <div>
                  <p className='text-xs text-gray-400 mb-0.5'>Yuborilgan vaqt</p>
                  <p className='text-xs text-gray-600'>
                    {new Date(selected.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>

                {/* Notify button */}
                <button
                  onClick={() => sendNotify(selected.id)}
                  disabled={notifyingId === selected.id}
                  className='w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2'
                >
                  {notifyingId === selected.id
                    ? <Loader2 size={14} className='animate-spin' />
                    : <Send size={14} />}
                  Bildirishnoma yuborish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
