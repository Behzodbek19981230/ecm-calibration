import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Application } from '../lib/types';

// ── API functions ──────────────────────────────────────────────

const fetchApplications = (status?: string): Promise<Application[]> =>
  api.get('/applications', { params: status ? { status } : {} }).then((r) => r.data);

const fetchApplication = (id: number): Promise<Application> =>
  api.get(`/applications/${id}`).then((r) => r.data);

const updateAppStatus = ({ id, status }: { id: number; status: string }): Promise<Application> =>
  api.patch(`/applications/${id}/status`, { status }).then((r) => r.data);

const acceptApplication = (id: number): Promise<Application> =>
  api.post(`/applications/${id}/accept`).then((r) => r.data);

const rejectApplication = ({ id, reason }: { id: number; reason: string }): Promise<{ success: boolean; letterText: string }> =>
  api.post(`/applications/${id}/reject`, { reason }).then((r) => r.data);

// ── Hooks ──────────────────────────────────────────────────────

export const APPS_KEY = ['applications'] as const;

export function useApplications(status?: string) {
  return useQuery({
    queryKey: status ? [...APPS_KEY, status] : APPS_KEY,
    queryFn: () => fetchApplications(status),
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: [...APPS_KEY, id],
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  });
}

export function useUpdateAppStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAppStatus,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: APPS_KEY });
      qc.invalidateQueries({ queryKey: [...APPS_KEY, vars.id] });
    },
  });
}

export function useAcceptApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptApplication,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: APPS_KEY });
      qc.invalidateQueries({ queryKey: [...APPS_KEY, id] });
    },
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectApplication,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: APPS_KEY });
      qc.invalidateQueries({ queryKey: [...APPS_KEY, vars.id] });
    },
  });
}
