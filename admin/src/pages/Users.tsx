import { useState } from 'react';
import { Users as UsersIcon, Plus, Pencil, X, Check, UserX, UserCheck } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useUsers, useCreateUser, useUpdateUser, useToggleUserActive,
  userFormSchema, VALID_ROLES, type UserFormValues,
} from '../services/userService';
import type { User, UserRole } from '../lib/types';
import { useLang } from '../lib/LangContext';

const ROLE_COLORS: Record<string, string> = {
  admin:            'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400',
  manager:          'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  buyro:            'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
  chief_laboratory: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
};

const INPUT_CLS =
  'w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-[hsl(205,45%,25%)] bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 disabled:opacity-50';

export default function Users() {
  const { t } = useLang();
  const u = t.users;

  const { data: users = [], isLoading } = useUsers();
  const createUser   = useCreateUser();
  const updateUser   = useUpdateUser();
  const toggleActive = useToggleUserActive();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const isCreating = !editing;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { username: '', password: '', fullName: '', email: '', isActive: true, roles: [] },
  });

  const { register, handleSubmit, control, reset, setError, formState: { errors, isSubmitting } } = form;

  function openCreate() {
    setEditing(null);
    reset({ username: '', password: '', fullName: '', email: '', isActive: true, roles: [] });
    setShowModal(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    reset({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      roles: user.roles.map((r) => r.role as UserRole),
    });
    setShowModal(true);
  }

  async function onSubmit(data: UserFormValues) {
    if (isCreating && !data.password) {
      setError('password', { message: 'Kamida 6 belgi' });
      return;
    }
    if (data.password && data.password.length < 6) {
      setError('password', { message: 'Kamida 6 belgi' });
      return;
    }

    try {
      const body: Record<string, unknown> = {
        fullName: data.fullName || undefined,
        email: data.email || undefined,
        isActive: data.isActive,
        roles: data.roles,
      };
      if (isCreating) {
        body.username = data.username;
        body.password = data.password;
        await createUser.mutateAsync(body);
      } else {
        if (data.password) body.password = data.password;
        await updateUser.mutateAsync({ id: editing!.id, body });
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError('root', { message: msg ?? t.common.error });
    }
  }

  const roleLabel = (role: string) => t.roles[role as keyof typeof t.roles] ?? role;
  const roleColor = (role: string) => ROLE_COLORS[role] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400';

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='flex items-center justify-between mb-6 sm:mb-8'>
        <div>
          <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>{u.title}</h1>
          <p className='text-sm text-gray-400 dark:text-slate-500 mt-0.5'>{users.length} {u.subtitle}</p>
        </div>
        <button
          onClick={openCreate}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90'
          style={{ background: 'hsl(205,45%,25%)' }}
        >
          <Plus size={16} />
          {u.createNew}
        </button>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='bg-white dark:bg-slate-800 rounded-xl h-14 animate-pulse border border-gray-100 dark:border-slate-700' />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className='bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-gray-100 dark:border-slate-700'>
          <UsersIcon size={40} className='text-gray-300 dark:text-slate-600 mx-auto mb-3' />
          <p className='text-gray-400 dark:text-slate-500 text-sm'>{u.noUsers}</p>
        </div>
      ) : (
        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm min-w-[600px]'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50'>
                  {[u.cols.login, u.cols.fullName, u.cols.email, u.cols.roles, u.cols.status, ''].map((h, i) => (
                    <th key={i} className='text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50 dark:divide-slate-700'>
                {users.map((user) => (
                  <tr key={user.id} className='hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'>
                    <td className='px-5 py-3 font-medium text-gray-800 dark:text-slate-100'>{user.username}</td>
                    <td className='px-5 py-3 text-gray-600 dark:text-slate-300'>{user.fullName || '—'}</td>
                    <td className='px-5 py-3 text-gray-500 dark:text-slate-400'>{user.email || '—'}</td>
                    <td className='px-5 py-3'>
                      <div className='flex flex-wrap gap-1'>
                        {user.roles.map((r) => (
                          <span key={r.id} className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor(r.role)}`}>
                            {roleLabel(r.role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='px-5 py-3'>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {user.isActive ? <Check size={10} /> : <X size={10} />}
                        {user.isActive ? u.active : u.blocked}
                      </span>
                    </td>
                    <td className='px-5 py-3'>
                      <div className='flex items-center gap-1 justify-end'>
                        <button onClick={() => openEdit(user)} className='p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all' title={t.common.edit}>
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive.mutate({ id: user.id, isActive: !user.isActive, roles: user.roles.map((r) => r.role) })}
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
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800'>
              <h3 className='font-semibold text-gray-800 dark:text-slate-100'>{editing ? u.modalEdit : u.modalCreate}</h3>
              <button onClick={() => setShowModal(false)} className='p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded'>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
              {errors.root && (
                <div className='p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400'>
                  {errors.root.message}
                </div>
              )}

              {/* Username */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>
                  {u.login} {isCreating && <span className='text-red-500'>{t.common.required}</span>}
                </label>
                <input {...register('username')} disabled={!!editing} placeholder='username' className={INPUT_CLS} />
                {errors.username && <p className='text-red-500 text-xs mt-1'>{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>
                  {u.password} {isCreating && <span className='text-red-500'>{t.common.required}</span>}
                  {editing && <span className='text-gray-400 dark:text-slate-500 font-normal text-xs ml-1'>{u.passwordHint}</span>}
                </label>
                <input {...register('password')} type='password' placeholder='••••••••' className={INPUT_CLS} />
                {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>{u.fullName}</label>
                <input {...register('fullName')} placeholder='Ism Familiya' className={INPUT_CLS} />
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>{u.email}</label>
                <input {...register('email')} type='email' placeholder='email@example.com' className={INPUT_CLS} />
                {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
              </div>

              {/* Roles */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2'>
                  {u.rolesLabel} <span className='text-red-500'>{t.common.required}</span>
                </label>
                <Controller
                  name='roles'
                  control={control}
                  render={({ field }) => (
                    <div className='space-y-2'>
                      {VALID_ROLES.map((role) => {
                        const checked = field.value.includes(role);
                        const toggle = () =>
                          field.onChange(checked ? field.value.filter((r) => r !== role) : [...field.value, role]);
                        return (
                          <label key={role} className='flex items-center gap-3 cursor-pointer group' onClick={toggle}>
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 ${checked ? 'border-transparent' : 'border-gray-300 dark:border-slate-600 group-hover:border-gray-400'}`}
                              style={checked ? { background: 'hsl(205,45%,25%)', borderColor: 'hsl(205,45%,25%)' } : {}}
                            >
                              {checked && <Check size={12} className='text-white' />}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[role]}`}>
                              {roleLabel(role)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.roles && <p className='text-red-500 text-xs mt-1'>{errors.roles.message}</p>}
              </div>

              {/* isActive toggle */}
              <Controller
                name='isActive'
                control={control}
                render={({ field }) => (
                  <div className='flex items-center gap-3'>
                    <div
                      onClick={() => field.onChange(!field.value)}
                      className={`w-10 h-6 rounded-full cursor-pointer transition-all flex items-center px-1 ${field.value ? '' : 'bg-gray-300 dark:bg-slate-600'}`}
                      style={field.value ? { background: 'hsl(205,45%,25%)' } : {}}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${field.value ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className='text-sm text-gray-700 dark:text-slate-300'>{u.isActive}</span>
                  </div>
                )}
              />

              <div className='flex gap-3 pt-2'>
                <button type='button' onClick={() => setShowModal(false)} className='flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all'>
                  {t.common.cancel}
                </button>
                <button type='submit' disabled={isSubmitting} className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90' style={{ background: 'hsl(205,45%,25%)' }}>
                  {isSubmitting ? t.common.saving : editing ? t.common.save : t.common.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
