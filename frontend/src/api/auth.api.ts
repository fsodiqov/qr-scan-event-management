import { apiClient, refreshAccessToken } from './client';
import { tokenMemory } from '@/utils/tokenMemory';
import type {
  ApiResponse,
  AuthProfile,
  AuthSession,
  AuthUser,
  LoginPayload,
  LoginResponse,
  UpdateProfilePayload,
} from '@/types';

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload,
    );
    const result = data.data!;
    tokenMemory.set(result.accessToken);
    return result;
  },

  async refresh(): Promise<string | null> {
    return refreshAccessToken();
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenMemory.clear();
    }
  },

  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
    tokenMemory.clear();
  },

  async me(): Promise<AuthProfile> {
    const { data } = await apiClient.get<ApiResponse<AuthProfile>>('/auth/me');
    return data.data!;
  },

  async listSessions(): Promise<AuthSession[]> {
    const { data } = await apiClient.get<ApiResponse<{ sessions: AuthSession[] }>>(
      '/auth/sessions',
    );
    return data.data!.sessions;
  },

  async revokeSession(id: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${id}`);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const { data } = await apiClient.patch<ApiResponse<{ user: AuthUser }>>('/auth/me', payload);
    return data.data!.user;
  },

  async uploadMyPhoto(file: File): Promise<AuthUser> {
    const formData = new FormData();
    formData.append('photo', file);
    const { data } = await apiClient.post<ApiResponse<{ user: AuthUser }>>(
      '/auth/me/photo',
      formData,
    );
    return data.data!.user;
  },
};
