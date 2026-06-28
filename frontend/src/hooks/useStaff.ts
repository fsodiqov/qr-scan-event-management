import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type { CreateStaffPayload, ListStaffParams, UpdateStaffPayload } from '@/types';

export function useStaff(params?: ListStaffParams) {
  return useQuery({
    queryKey: queryKeys.staff.list(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useStaffMember(id?: string) {
  return useQuery({
    queryKey: queryKeys.staff.detail(id!),
    queryFn: () => usersApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStaffPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(variables.id) });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}
