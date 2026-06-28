import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type {
  CreateOrganizationPayload,
  ListOrganizationsParams,
  ListOrganizationUsersParams,
  UpdateMyOrganizationPayload,
  UpdateOrganizationPayload,
  UpdateOrganizationUserPayload,
} from '@/types';

export function useOrganizations(params?: ListOrganizationsParams) {
  return useQuery({
    queryKey: queryKeys.organizations.list(params),
    queryFn: () => organizationsApi.list(params),
  });
}

export function useOrganization(id?: string) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id!),
    queryFn: () => organizationsApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useMyOrganization() {
  return useQuery({
    queryKey: queryKeys.organizations.me,
    queryFn: () => organizationsApi.getMe(),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) => organizationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.platformDashboard.stats });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrganizationPayload }) =>
      organizationsApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.id),
      });
    },
  });
}

export function useUpdateMyOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyOrganizationPayload) => organizationsApi.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.platformDashboard.stats });
    },
  });
}

export function useOrganizationMembers(
  organizationId?: string,
  params?: ListOrganizationUsersParams,
) {
  return useQuery({
    queryKey: queryKeys.organizations.members(organizationId!, params),
    queryFn: () => organizationsApi.listMembers(organizationId!, params),
    enabled: Boolean(organizationId),
  });
}

export function useUpdateOrganizationMember(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: UpdateOrganizationUserPayload;
    }) => organizationsApi.updateMember(organizationId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members(organizationId),
      });
    },
  });
}
