import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationUsersApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type {
  CreateOrganizationUserPayload,
  ListOrganizationUsersParams,
  UpdateOrganizationUserPayload,
} from '@/types';

export function useOrganizationUsers(params?: ListOrganizationUsersParams) {
  return useQuery({
    queryKey: queryKeys.organizationUsers.list(params),
    queryFn: () => organizationUsersApi.list(params),
  });
}

export function useOrganizationUser(id?: string) {
  return useQuery({
    queryKey: queryKeys.organizationUsers.detail(id!),
    queryFn: () => organizationUsersApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateOrganizationUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationUserPayload) =>
      organizationUsersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationUsers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useUpdateOrganizationUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrganizationUserPayload }) =>
      organizationUsersApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationUsers.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizationUsers.detail(variables.id),
      });
    },
  });
}

export function useDeleteOrganizationUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationUsersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationUsers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}
