import { apiClient } from './client';
import type {
  ApiResponse,
  CreateSubscriptionPayload,
  ListSubscriptionsParams,
  Subscription,
  UpdateSubscriptionPayload,
} from '@/types';

export const subscriptionsApi = {
  async list(params?: ListSubscriptionsParams): Promise<{
    subscriptions: Subscription[];
    meta?: ApiResponse<Subscription[]>['meta'];
  }> {
    const { data } = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions', {
      params,
    });
    return { subscriptions: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<Subscription> {
    const { data } = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return data.data!;
  },

  async create(payload: CreateSubscriptionPayload): Promise<Subscription> {
    const { data } = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', payload);
    return data.data!;
  },

  async update(id: string, payload: UpdateSubscriptionPayload): Promise<Subscription> {
    const { data } = await apiClient.put<ApiResponse<Subscription>>(
      `/subscriptions/${id}`,
      payload,
    );
    return data.data!;
  },

  async getMySubscription(): Promise<Subscription | null> {
    const { data } = await apiClient.get<ApiResponse<Subscription | null>>('/subscriptions/me');
    return data.data ?? null;
  },
};
