import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import api from '../lib/api';
import type { Region } from '../lib/types';

export const regionNameSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart').max(100),
});

export type RegionNameValues = z.infer<typeof regionNameSchema>;

// ── API functions ──────────────────────────────────────────────

const fetchRegions = (): Promise<Region[]> =>
  api.get('/regions').then((r) => r.data);

const createRegion = (name: string) =>
  api.post('/regions', { name }).then((r) => r.data);

const deleteRegion = (id: number) =>
  api.delete(`/regions/${id}`);

const createDistrict = ({ regionId, name }: { regionId: number; name: string }) =>
  api.post(`/regions/${regionId}/districts`, { name }).then((r) => r.data);

const deleteDistrict = (id: number) =>
  api.delete(`/regions/districts/${id}`);

// ── Hooks ──────────────────────────────────────────────────────

const REGIONS_KEY = ['regions'] as const;

export function useRegions() {
  return useQuery({ queryKey: REGIONS_KEY, queryFn: fetchRegions });
}

export function useCreateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRegion,
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY }),
  });
}

export function useDeleteRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY }),
  });
}

export function useCreateDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDistrict,
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY }),
  });
}

export function useDeleteDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY }),
  });
}
