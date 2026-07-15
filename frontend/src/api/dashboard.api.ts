import { apiClient } from './client';
import type { ApiResponse, DashboardReport, DashboardReportParams, DashboardStats, RecentActivity } from '@/types';

export const dashboardApi = {
  async getStats(eventId?: string): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', {
      params: eventId ? { eventId } : undefined,
    });
    return data.data!;
  },

  async getReport(params?: DashboardReportParams): Promise<DashboardReport> {
    const { data } = await apiClient.get<ApiResponse<DashboardReport>>('/dashboard/report', {
      params,
    });
    return data.data!;
  },

  async getRecent(eventId?: string, page = 1, limit = 5) {
    const { data } = await apiClient.get<ApiResponse<RecentActivity[]>>('/dashboard/recent', {
      params: { eventId, page, limit },
    });
    return { items: data.data ?? [], meta: data.meta };
  },
};
