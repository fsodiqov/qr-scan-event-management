import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';

export function useDashboardStats(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(eventId),
    queryFn: () => dashboardApi.getStats(eventId),
  });
}

export function useRecentActivity(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.recent(eventId),
    queryFn: () => dashboardApi.getRecent(eventId),
  });
}
