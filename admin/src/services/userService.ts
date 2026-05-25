import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import api from '../lib/api';
import type { User } from '../lib/types';

// superadmin is intentionally excluded — cannot be created via UI
export const VALID_ROLES = ['admin', 'manager', 'buyro', 'chief_laboratory'] as const;
export const ALL_ROLES = ['superadmin', 'admin', 'manager', 'buyro', 'chief_laboratory'] as const;

export const userFormSchema = z.object({
  username: z.string().min(3, 'Kamida 3 belgi').max(32),
  password: z.string().optional(),
  fullName: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Noto'g'ri email",
    ),
  isActive: z.boolean(),
  roles: z.array(z.enum(ALL_ROLES)).min(1, 'Kamida bitta rol tanlang'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

// ── API functions ──────────────────────────────────────────────

const fetchUsers = (): Promise<User[]> =>
  api.get('/users').then((r) => r.data);

const createUser = (body: Record<string, unknown>): Promise<User> =>
  api.post('/users', body).then((r) => r.data);

const updateUser = ({ id, body }: { id: number; body: Record<string, unknown> }): Promise<User> =>
  api.patch(`/users/${id}`, body).then((r) => r.data);

const toggleUserActive = ({ id, isActive, roles }: { id: number; isActive: boolean; roles: string[] }): Promise<User> =>
  api.patch(`/users/${id}`, { isActive, roles }).then((r) => r.data);

// ── Hooks ──────────────────────────────────────────────────────

const USERS_KEY = ['users'] as const;

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: fetchUsers });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
