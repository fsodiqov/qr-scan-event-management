import { apiClient } from './client';
import type {
  ApiResponse,
  CreateEventPayload,
  Event,
  EventDetail,
  EventStatus,
  ListEventsParams,
  UpdateEventPayload,
} from '@/types';

export const eventsApi = {
  async list(params?: ListEventsParams): Promise<{ events: Event[]; meta?: ApiResponse<Event[]>['meta'] }> {
    const { data } = await apiClient.get<ApiResponse<Event[]>>('/events', { params });
    return { events: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<EventDetail> {
    const { data } = await apiClient.get<ApiResponse<EventDetail>>(`/events/${id}`);
    return data.data!;
  },

  async create(payload: CreateEventPayload): Promise<Event> {
    const { data } = await apiClient.post<ApiResponse<Event>>('/events', payload);
    return data.data!;
  },

  async update(id: string, payload: UpdateEventPayload): Promise<Event> {
    const { data } = await apiClient.put<ApiResponse<Event>>(`/events/${id}`, payload);
    return data.data!;
  },

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    const { data } = await apiClient.patch<ApiResponse<Event>>(`/events/${id}/status`, { status });
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },
};
