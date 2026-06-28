import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type { AuthProfile, UpdateProfilePayload } from '@/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData<AuthProfile>(queryKeys.auth.me, (current) =>
        current ? { ...current, user } : current,
      );
    },
  });
}
