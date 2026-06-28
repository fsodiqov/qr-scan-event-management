import { apiClient } from './client';
import type { ApiResponse, AuthProfile, AuthUser, LoginPayload, LoginResponse, UpdateProfilePayload } from '@/types';

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload,
    );
    return data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<AuthProfile> {
    const { data } = await apiClient.get<ApiResponse<AuthProfile>>('/auth/me');
    return data.data!;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const { data } = await apiClient.patch<ApiResponse<{ user: AuthUser }>>('/auth/me', payload);
    return data.data!.user;
  },
};
