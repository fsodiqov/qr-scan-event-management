import { apiClient } from './client';
import type {
  ApiResponse,
  CreateUserPayload,
  CreateUserResponse,
  ListUsersParams,
  QrCodeData,
  UpdateUserPayload,
  User,
} from '@/types';

export const usersApi = {
  async list(params?: ListUsersParams): Promise<{ users: User[]; meta?: ApiResponse<User[]>['meta'] }> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return { users: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data.data!;
  },

  async create(payload: CreateUserPayload): Promise<CreateUserResponse> {
    const { data } = await apiClient.post<ApiResponse<CreateUserResponse>>('/users', payload);
    return data.data!;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<User> {
    const { data } = await apiClient.delete<ApiResponse<User>>(`/users/${id}`);
    return data.data!;
  },

  async getQr(id: string): Promise<QrCodeData> {
    const { data } = await apiClient.get<ApiResponse<QrCodeData>>(`/users/${id}/qr`);
    return data.data!;
  },

  async regenerateQr(id: string): Promise<QrCodeData> {
    const { data } = await apiClient.post<ApiResponse<QrCodeData>>(`/users/${id}/regenerate-qr`);
    return data.data!;
  },
};
