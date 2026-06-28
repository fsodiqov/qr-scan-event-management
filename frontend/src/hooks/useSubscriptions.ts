import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import type {
  CreateSubscriptionPayload,
  ListSubscriptionsParams,
  UpdateSubscriptionPayload,
} from '@/types';

export function useSubscriptions(params?: ListSubscriptionsParams) {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(params),
    queryFn: () => subscriptionsApi.list(params),
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: queryKeys.subscriptions.me,
    queryFn: () => subscriptionsApi.getMySubscription(),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubscriptionPayload) => subscriptionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubscriptionPayload }) =>
      subscriptionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
    },
  });
}
