import { apiClient } from './client';
import type {
  ApiResponse,
  CreateStaffPayload,
  CreateStaffResponse,
  ListStaffParams,
  StaffUser,
  UpdateStaffPayload,
} from '@/types';

export const usersApi = {
  async list(params?: ListStaffParams): Promise<{
    users: StaffUser[];
    meta?: ApiResponse<StaffUser[]>['meta'];
  }> {
    const { data } = await apiClient.get<ApiResponse<StaffUser[]>>('/users', { params });
    return { users: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<StaffUser> {
    const { data } = await apiClient.get<ApiResponse<StaffUser>>(`/users/${id}`);
    return data.data!;
  },

  async create(payload: CreateStaffPayload): Promise<CreateStaffResponse> {
    const { data } = await apiClient.post<ApiResponse<CreateStaffResponse>>('/users', payload);
    return data.data!;
  },

  async update(id: string, payload: UpdateStaffPayload): Promise<StaffUser> {
    const { data } = await apiClient.put<ApiResponse<StaffUser>>(`/users/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<StaffUser> {
    const { data } = await apiClient.delete<ApiResponse<StaffUser>>(`/users/${id}`);
    return data.data!;
  },
};
