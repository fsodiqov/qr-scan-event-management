import { apiClient } from './client';
import type {
  ApiResponse,
  CreateParticipantPayload,
  ListParticipantsParams,
  Participant,
  QrCodeData,
  UpdateParticipantPayload,
} from '@/types';

export const participantsApi = {
  async list(params?: ListParticipantsParams): Promise<{
    participants: Participant[];
    meta?: ApiResponse<Participant[]>['meta'];
  }> {
    const { data } = await apiClient.get<ApiResponse<Participant[]>>('/participants', { params });
    return { participants: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<Participant> {
    const { data } = await apiClient.get<ApiResponse<Participant>>(`/participants/${id}`);
    return data.data!;
  },

  async create(payload: CreateParticipantPayload): Promise<Participant> {
    const { data } = await apiClient.post<ApiResponse<Participant>>('/participants', payload);
    return data.data!;
  },

  async update(id: string, payload: UpdateParticipantPayload): Promise<Participant> {
    const { data } = await apiClient.put<ApiResponse<Participant>>(`/participants/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<Participant> {
    const { data } = await apiClient.delete<ApiResponse<Participant>>(`/participants/${id}`);
    return data.data!;
  },

  async getQr(id: string): Promise<QrCodeData> {
    const { data } = await apiClient.get<ApiResponse<QrCodeData>>(`/participants/${id}/qr`);
    return data.data!;
  },

  async regenerateQr(id: string): Promise<QrCodeData> {
    const { data } = await apiClient.post<ApiResponse<QrCodeData>>(
      `/participants/${id}/regenerate-qr`,
    );
    return data.data!;
  },

  async listByEvent(eventId: string, params?: ListParticipantsParams) {
    const { data } = await apiClient.get<ApiResponse<Participant[]>>(
      `/events/${eventId}/participants`,
      { params },
    );
    return { participants: data.data ?? [], meta: data.meta };
  },
};
