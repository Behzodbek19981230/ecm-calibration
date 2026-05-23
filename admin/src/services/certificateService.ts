import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import api from '../lib/api';
import type { Certificate, Application } from '../lib/types';

export const certFormSchema = z.object({
  applicationId: z.string().min(1, 'Ariza tanlang'),
  expiresAt: z.string().min(1, 'Muddatni kiriting'),
  notes: z.string().optional(),
});

export type CertFormValues = z.infer<typeof certFormSchema>;

// ── API functions ──────────────────────────────────────────────

const fetchCertificates = (): Promise<Certificate[]> =>
  api.get('/certificates').then((r) => r.data);

const fetchCompletedApps = (): Promise<Application[]> =>
  api
    .get('/applications', { params: { status: 'completed' } })
    .then((r) => r.data as Application[]);

const createCertificate = (fd: FormData): Promise<Certificate> =>
  api
    .post('/certificates', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

const revokeCertificate = (id: number): Promise<Certificate> =>
  api.patch(`/certificates/${id}`, { status: 'revoked' }).then((r) => r.data);

// ── Hooks ──────────────────────────────────────────────────────

const CERTS_KEY = ['certificates'] as const;
const COMPLETED_APPS_KEY = ['applications', 'completed'] as const;

export function useCertificates() {
  return useQuery({ queryKey: CERTS_KEY, queryFn: fetchCertificates });
}

export function useCompletedApps() {
  return useQuery({ queryKey: COMPLETED_APPS_KEY, queryFn: fetchCompletedApps });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCertificate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CERTS_KEY });
      qc.invalidateQueries({ queryKey: COMPLETED_APPS_KEY });
    },
  });
}

export function useRevokeCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeCertificate,
    onSuccess: () => qc.invalidateQueries({ queryKey: CERTS_KEY }),
  });
}
