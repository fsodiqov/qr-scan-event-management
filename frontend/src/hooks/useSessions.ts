import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import { tokenMemory } from '@/utils/tokenMemory';

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: () => authApi.listSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: async (_data, id) => {
      const sessions = queryClient.getQueryData<Awaited<ReturnType<typeof authApi.listSessions>>>(
        queryKeys.auth.sessions,
      );
      const revoked = sessions?.find((s) => s.id === id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions });
      if (revoked?.current) {
        tokenMemory.clear();
        window.location.href = '/login';
      }
    },
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      tokenMemory.clear();
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}
