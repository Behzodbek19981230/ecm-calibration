import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Application, Certificate } from '../lib/types';

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

const sendContract = ({ id, price }: { id: number; price: string }): Promise<{ sent: boolean; method?: string }> =>
  api.post(`/applications/${id}/send-contract`, { price }).then((r) => r.data);

const acceptInstruments = (id: number): Promise<{ success: boolean }> =>
  api.post(`/applications/${id}/accept-instruments`).then((r) => r.data);

const attachCertificate = ({ id, fd }: { id: number; fd: FormData }): Promise<Certificate> =>
  api.post(`/applications/${id}/attach-certificate`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

const completeApplication = (id: number): Promise<Application> =>
  api.post(`/applications/${id}/complete`).then((r) => r.data);

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

export function useSendContract() {
  return useMutation({ mutationFn: sendContract });
}

export function useAcceptInstruments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptInstruments,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: APPS_KEY });
      qc.invalidateQueries({ queryKey: [...APPS_KEY, id] });
    },
  });
}

export function useAttachCertificate(appId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => attachCertificate({ id: appId, fd }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...APPS_KEY, appId] });
    },
  });
}

export function useCompleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeApplication,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: APPS_KEY });
      qc.invalidateQueries({ queryKey: [...APPS_KEY, id] });
    },
  });
}
