import { useState } from 'react';
import { CheckCheck, Trash2, Eye, X, Phone, Mail, Building2 } from 'lucide-react';
import { useContacts, useMarkContactRead, useDeleteContact } from '../services/contactService';
import type { Contact } from '../lib/types';
import { useLang } from '../lib/LangContext';

export default function Contacts() {
  const { t } = useLang();
  const c = t.contacts;

  const { data: contacts = [], isLoading } = useContacts();
  const markRead   = useMarkContactRead();
  const deleteItem = useDeleteContact();

  const [selected, setSelected] = useState<Contact | null>(null);

  function handleView(contact: Contact) {
    setSelected(contact);
    if (!contact.isRead) markRead.mutate(contact.id);
  }

  async function handleDelete(id: number) {
    if (!confirm(c.confirmDelete)) return;
    deleteItem.mutate(id);
    if (selected?.id === id) setSelected(null);
  }

  const unread = contacts.filter((x) => !x.isRead).length;

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>{c.title}</h1>
        <p className='text-sm mt-0.5'>
          {unread > 0
            ? <span className='text-amber-500 font-medium'>{unread} {c.unread}</span>
            : <span className='text-gray-400 dark:text-slate-500'>{c.allRead}</span>}
        </p>
      </div>

      <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
        {isLoading ? (
          <div className='p-8 text-center text-sm text-gray-400 dark:text-slate-500'>{t.common.loading}</div>
        ) : contacts.length === 0 ? (
          <div className='p-12 text-center'>
            <Mail size={32} className='mx-auto text-gray-300 dark:text-slate-600 mb-3' />
            <p className='text-gray-400 dark:text-slate-500'>{c.noContacts}</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[580px]'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50'>
                  {[c.cols.status, c.cols.name, c.cols.email, c.cols.company, c.cols.date, ''].map((h, i) => (
                    <th key={i} className='text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50 dark:divide-slate-700'>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!contact.isRead ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}
                  >
                    <td className='px-5 py-3.5'>
                      <span className={`inline-block w-2 h-2 rounded-full ${contact.isRead ? 'bg-gray-300 dark:bg-slate-600' : 'bg-amber-400'}`} />
                    </td>
                    <td className='px-5 py-3.5'>
                      <p className={`text-sm ${!contact.isRead ? 'font-semibold text-gray-800 dark:text-slate-100' : 'text-gray-700 dark:text-slate-200'}`}>{contact.name}</p>
                      {contact.subject && <p className='text-xs text-gray-400 dark:text-slate-500 truncate max-w-[160px]'>{contact.subject}</p>}
                    </td>
                    <td className='px-5 py-3.5 text-sm text-gray-600 dark:text-slate-300'>{contact.email}</td>
                    <td className='px-5 py-3.5 text-sm text-gray-500 dark:text-slate-400'>{contact.company || '—'}</td>
                    <td className='px-5 py-3.5 text-xs text-gray-400 dark:text-slate-500'>{new Date(contact.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-1 justify-end'>
                        <button onClick={() => handleView(contact)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all' title={t.common.view}>
                          <Eye size={14} />
                        </button>
                        {!contact.isRead && (
                          <button onClick={() => markRead.mutate(contact.id)} className='p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/50 text-gray-500 dark:text-slate-400 hover:text-green-600 transition-all' title={c.markRead}>
                            <CheckCheck size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(contact.id)} className='p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-gray-500 dark:text-slate-400 hover:text-red-500 transition-all' title={t.common.delete}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700'>
              <h3 className='font-semibold text-gray-800 dark:text-slate-100'>{selected.name}</h3>
              <button onClick={() => setSelected(null)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-all'>
                <X size={16} />
              </button>
            </div>
            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300'>
                  <Mail size={14} className='text-gray-400 dark:text-slate-500' />
                  <a href={`mailto:${selected.email}`} className='hover:underline'>{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300'>
                    <Phone size={14} className='text-gray-400 dark:text-slate-500' />
                    <a href={`tel:${selected.phone}`} className='hover:underline'>{selected.phone}</a>
                  </div>
                )}
                {selected.company && (
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300'>
                    <Building2 size={14} className='text-gray-400 dark:text-slate-500' />
                    {selected.company}
                  </div>
                )}
              </div>
              {selected.subject && (
                <div>
                  <p className='text-xs font-medium text-gray-400 dark:text-slate-500 uppercase mb-1'>{c.subject}</p>
                  <p className='text-sm text-gray-700 dark:text-slate-200'>{selected.subject}</p>
                </div>
              )}
              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-slate-500 uppercase mb-1'>{c.message}</p>
                <p className='text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed'>{selected.message}</p>
              </div>
              <p className='text-xs text-gray-400 dark:text-slate-500'>{new Date(selected.createdAt).toLocaleString('uz-UZ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
