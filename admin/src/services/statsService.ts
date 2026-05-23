import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { DashboardStats } from '../lib/types';

// ── API functions ──────────────────────────────────────────────

const fetchDashboardStats = (): Promise<DashboardStats> =>
  api.get('/stats/dashboard').then((r) => r.data);

// ── Hooks ──────────────────────────────────────────────────────

const STATS_KEY = ['stats', 'dashboard'] as const;

export function useDashboardStats() {
  return useQuery({ queryKey: STATS_KEY, queryFn: fetchDashboardStats });
}
