import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type { AuthProfile, AuthUser, UpdateProfilePayload } from '@/types';

function patchAuthUser(queryClient: QueryClient, user: AuthUser) {
  queryClient.setQueryData<AuthProfile>(queryKeys.auth.me, (current) =>
    current ? { ...current, user } : current,
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (user) => {
      patchAuthUser(queryClient, user);
    },
  });
}

export function useUploadMyPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => authApi.uploadMyPhoto(file),
    onSuccess: (user) => {
      patchAuthUser(queryClient, user);
    },
  });
}
