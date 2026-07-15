import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';
import type { DashboardReportParams } from '@/types';

export function useDashboardStats(eventId?: string) {
  const { hasPermission } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.stats(eventId),
    queryFn: () => dashboardApi.getStats(eventId),
    enabled: hasPermission(PERMISSIONS.ORG_DASHBOARD),
  });
}

export function useDashboardReport(params?: DashboardReportParams, enabled = true) {
  const { hasPermission } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.report(params),
    queryFn: () => dashboardApi.getReport(params),
    enabled: enabled && hasPermission(PERMISSIONS.ORG_DASHBOARD),
  });
}

export function useRecentActivity(eventId?: string, limit = 5) {
  const { hasPermission } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.dashboard.recent(eventId), limit],
    queryFn: () => dashboardApi.getRecent(eventId, 1, limit),
    enabled: hasPermission(PERMISSIONS.ORG_DASHBOARD),
  });
}
