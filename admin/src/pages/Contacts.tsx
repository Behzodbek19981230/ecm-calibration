import { useEffect, useState } from 'react';
import { CheckCheck, Trash2, Eye, X, Phone, Mail, Building2 } from 'lucide-react';
import api from '../lib/api';
import type { Contact } from '../lib/types';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  function fetchContacts() {
    api.get('/contacts').then((r) => setContacts(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchContacts(); }, []);

  async function markRead(id: number) {
    await api.patch(`/contacts/${id}/read`);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, isRead: true } : c));
    if (selected?.id === id) setSelected((p) => p ? { ...p, isRead: true } : p);
  }

  async function deleteContact(id: number) {
    if (!confirm("Bu xabarni o'chirishni xohlaysizmi?")) return;
    await api.delete(`/contacts/${id}`);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const unread = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Xabarlar</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unread > 0 ? (
              <span className="text-orange-500 font-medium">{unread} ta o'qilmagan</span>
            ) : (
              'Barcha xabarlar o\'qilgan'
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Yuklanmoqda...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">Hozircha xabar yo'q</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Holat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ism</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Kompaniya</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50 transition-colors ${!c.isRead ? 'bg-orange-50/30' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${c.isRead ? 'bg-gray-300' : 'bg-orange-400'}`}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <p className={`text-sm ${!c.isRead ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                      {c.name}
                    </p>
                    {c.subject && (
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.subject}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{c.company || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => { setSelected(c); if (!c.isRead) markRead(c.id); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                        title="Ko'rish"
                      >
                        <Eye size={14} />
                      </button>
                      {!c.isRead && (
                        <button
                          onClick={() => markRead(c.id)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-all"
                          title="O'qilgan deb belgilash"
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                        title="O'chirish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{selected.name}</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <a href={`tel:${selected.phone}`} className="hover:underline">{selected.phone}</a>
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={14} className="text-gray-400" />
                    {selected.company}
                  </div>
                )}
              </div>
              {selected.subject && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Mavzu</p>
                  <p className="text-sm text-gray-700">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Xabar</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(selected.createdAt).toLocaleString('uz-UZ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
