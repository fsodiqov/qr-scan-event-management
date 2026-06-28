import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';

export function useDashboardStats(eventId?: string) {
  const { hasPermission } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.stats(eventId),
    queryFn: () => dashboardApi.getStats(eventId),
    enabled: hasPermission(PERMISSIONS.ORG_DASHBOARD),
  });
}

export function useRecentActivity(eventId?: string) {
  const { hasPermission } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.recent(eventId),
    queryFn: () => dashboardApi.getRecent(eventId),
    enabled: hasPermission(PERMISSIONS.ORG_DASHBOARD),
  });
}
