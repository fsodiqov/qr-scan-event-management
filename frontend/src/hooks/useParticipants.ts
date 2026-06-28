import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { participantsApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type {
  CreateParticipantPayload,
  ListParticipantsParams,
  UpdateParticipantPayload,
} from '@/types';

export function useParticipants(params?: ListParticipantsParams) {
  return useQuery({
    queryKey: queryKeys.participants.list(params),
    queryFn: () => participantsApi.list(params),
  });
}

export function useParticipant(id?: string) {
  return useQuery({
    queryKey: queryKeys.participants.detail(id!),
    queryFn: () => participantsApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useParticipantQr(id?: string) {
  return useQuery({
    queryKey: queryKeys.participants.qr(id!),
    queryFn: () => participantsApi.getQr(id!),
    enabled: Boolean(id),
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateParticipantPayload) => participantsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.participants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateParticipantPayload }) =>
      participantsApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.participants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.participants.detail(variables.id) });
    },
  });
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => participantsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.participants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
}

export function useRegenerateParticipantQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => participantsApi.regenerateQr(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.participants.qr(id) });
    },
  });
}
