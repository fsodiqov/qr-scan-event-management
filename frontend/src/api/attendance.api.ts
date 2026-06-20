import { apiClient } from './client';
import type {
  ApiResponse,
  Attendance,
  ListAttendanceParams,
  ScanPayload,
  ScanResponse,
} from '@/types';

export const attendanceApi = {
  async list(params?: ListAttendanceParams): Promise<{ records: Attendance[]; meta?: ApiResponse<Attendance[]>['meta'] }> {
    const { data } = await apiClient.get<ApiResponse<Attendance[]>>('/attendance', { params });
    return { records: data.data ?? [], meta: data.meta };
  },

  async getByEvent(eventId: string, params?: ListAttendanceParams) {
    const { data } = await apiClient.get<ApiResponse<Attendance[]>>(
      `/attendance/event/${eventId}`,
      { params },
    );
    return { records: data.data ?? [], meta: data.meta };
  },

  async scan(payload: ScanPayload): Promise<ScanResponse> {
    const { data } = await apiClient.post<ApiResponse<ScanResponse>>('/attendance/scan', payload);
    return data.data!;
  },
};
