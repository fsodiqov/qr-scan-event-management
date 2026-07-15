import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type { ListAttendanceParams, ScanPayload } from '@/types';

export function useAttendance(params?: ListAttendanceParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.attendance.list(params),
    queryFn: () => attendanceApi.list(params),
    enabled,
  });
}

export function useScanQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScanPayload) => attendanceApi.scan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recent() });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'report'] });
    },
  });
}
