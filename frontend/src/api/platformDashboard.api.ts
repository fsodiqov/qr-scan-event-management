import { apiClient } from './client';
import type { ApiResponse, PlatformDashboardStats } from '@/types';

export const platformDashboardApi = {
  async getStats(): Promise<PlatformDashboardStats> {
    const { data } = await apiClient.get<ApiResponse<PlatformDashboardStats>>(
      '/platform/dashboard/stats',
    );
    return data.data!;
  },
};
