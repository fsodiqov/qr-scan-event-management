import { useQuery } from '@tanstack/react-query';
import { platformDashboardApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';

export function usePlatformDashboardStats() {
  return useQuery({
    queryKey: queryKeys.platformDashboard.stats,
    queryFn: () => platformDashboardApi.getStats(),
  });
}
