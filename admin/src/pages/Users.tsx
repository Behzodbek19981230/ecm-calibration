import { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus, Pencil, X, Check, UserX, UserCheck } from 'lucide-react';
import api from '../lib/api';
import type { User, UserRole } from '../lib/types';
import { useLang } from '../lib/LangContext';

const ROLES: { value: UserRole; colorClass: string }[] = [
  { value: 'admin',            colorClass: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400' },
  { value: 'manager',          colorClass: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400' },
  { value: 'buyro',            colorClass: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400' },
  { value: 'chief_laboratory', colorClass: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' },
];

interface FormState {
  username: string; password: string; fullName: string;
  email: string; isActive: boolean; roles: UserRole[];
}
const emptyForm: FormState = { username: '', password: '', fullName: '', email: '', isActive: true, roles: [] };

export default function Users() {
  const { t } = useLang();
  const u = t.users;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function fetchUsers() { return api.get('/users').then((r) => setUsers(r.data)); }
  useEffect(() => { fetchUsers().finally(() => setLoading(false)); }, []);

  function openCreate() { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); }
  function openEdit(user: User) {
    setEditing(user);
    setForm({ username: user.username, password: '', fullName: user.fullName, email: user.email, isActive: user.isActive, roles: user.roles.map((r) => r.role as UserRole) });
    setError(''); setShowModal(true);
  }

  function toggleRole(role: UserRole) {
    setForm((p) => ({ ...p, roles: p.roles.includes(role) ? p.roles.filter((r) => r !== role) : [...p.roles, role] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.roles.length === 0) { setError(u.rolesRequired); return; }
    setSubmitting(true); setError('');
    try {
      const body: Record<string, unknown> = { fullName: form.fullName, email: form.email, isActive: form.isActive, roles: form.roles };
      if (!editing) { body.username = form.username; body.password = form.password; }
      else if (form.password) { body.password = form.password; }
      if (editing) { await api.patch(`/users/${editing.id}`, body); } else { await api.post('/users', body); }
      await fetchUsers(); setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? t.common.error);
    } finally { setSubmitting(false); }
  }

  async function handleToggleActive(user: User) {
    await api.patch(`/users/${user.id}`, { isActive: !user.isActive, roles: user.roles.map((r) => r.role) });
    await fetchUsers();
  }

  const roleLabel = (role: string) =>
    t.roles[role as keyof typeof t.roles] ?? role;
  const roleColor = (role: string) =>
    ROLES.find((r) => r.value === role)?.colorClass ?? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{u.title}</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{users.length} {u.subtitle}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'hsl(205,45%,25%)' }}
        >
          <Plus size={16} />
          {u.createNew}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl h-14 animate-pulse border border-gray-100 dark:border-slate-700" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-gray-100 dark:border-slate-700">
          <UsersIcon size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 text-sm">{u.noUsers}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  {[u.cols.login, u.cols.fullName, u.cols.email, u.cols.roles, u.cols.status, ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-slate-100">{user.username}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-slate-300">{user.fullName || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-slate-400">{user.email || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span key={r.id} className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor(r.role)}`}>
                            {roleLabel(r.role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {user.isActive ? <Check size={10} /> : <X size={10} />}
                        {user.isActive ? u.active : u.blocked}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all" title={t.common.edit}>
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-1.5 rounded-lg transition-all ${user.isActive ? 'text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50' : 'text-gray-400 dark:text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50'}`}
                          title={user.isActive ? u.block : u.unblock}
                        >
                          {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">{editing ? u.modalEdit : u.modalCreate}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">{error}</div>}

              {[
                { key: 'username', label: u.login, type: 'text', disabled: !!editing, required: !editing, placeholder: 'username' },
                { key: 'password', label: u.password, type: 'password', disabled: false, required: !editing, placeholder: '••••••••', hint: editing ? u.passwordHint : undefined },
                { key: 'fullName', label: u.fullName, type: 'text', disabled: false, required: false, placeholder: 'Ism Familiya' },
                { key: 'email',    label: u.email,    type: 'email', disabled: false, required: false, placeholder: 'email@example.com' },
              ].map(({ key, label, type, disabled, required, placeholder, hint }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    {label} {required && <span className="text-red-500">{t.common.required}</span>}
                    {hint && <span className="text-gray-400 dark:text-slate-500 font-normal text-xs ml-1">{hint}</span>}
                  </label>
                  <input
                    type={type} value={form[key as keyof FormState] as string}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    disabled={disabled} required={required} placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-[hsl(205,45%,25%)] bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 disabled:bg-gray-100 dark:disabled:bg-slate-700/50 disabled:text-gray-400 dark:disabled:text-slate-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  {u.rolesLabel} <span className="text-red-500">{t.common.required}</span>
                </label>
                <div className="space-y-2">
                  {ROLES.map(({ value, colorClass }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleRole(value)}
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer ${form.roles.includes(value) ? 'border-transparent' : 'border-gray-300 dark:border-slate-600 group-hover:border-gray-400'}`}
                        style={form.roles.includes(value) ? { background: 'hsl(205,45%,25%)', borderColor: 'hsl(205,45%,25%)' } : {}}
                      >
                        {form.roles.includes(value) && <Check size={12} className="text-white" />}
                      </div>
                      <span onClick={() => toggleRole(value)} className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${colorClass}`}>
                        {roleLabel(value)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`w-10 h-6 rounded-full cursor-pointer transition-all flex items-center px-1 ${form.isActive ? '' : 'bg-gray-300 dark:bg-slate-600'}`}
                  style={form.isActive ? { background: 'hsl(205,45%,25%)' } : {}}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300">{u.isActive}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                  {t.common.cancel}
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90" style={{ background: 'hsl(205,45%,25%)' }}>
                  {submitting ? t.common.saving : editing ? t.common.save : t.common.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
