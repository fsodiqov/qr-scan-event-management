import { apiClient } from './client';
import type {
  ApiResponse,
  CreateOrganizationUserPayload,
  CreateOrganizationUserResponse,
  ListOrganizationUsersParams,
  OrganizationUser,
  UpdateOrganizationUserPayload,
} from '@/types';

export const organizationUsersApi = {
  async list(params?: ListOrganizationUsersParams): Promise<{
    members: OrganizationUser[];
    meta?: ApiResponse<OrganizationUser[]>['meta'];
  }> {
    const { data } = await apiClient.get<ApiResponse<OrganizationUser[]>>(
      '/organization-users',
      { params },
    );
    return { members: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<OrganizationUser> {
    const { data } = await apiClient.get<ApiResponse<OrganizationUser>>(
      `/organization-users/${id}`,
    );
    return data.data!;
  },

  async create(payload: CreateOrganizationUserPayload): Promise<CreateOrganizationUserResponse> {
    const { data } = await apiClient.post<ApiResponse<CreateOrganizationUserResponse>>(
      '/organization-users',
      payload,
    );
    return data.data!;
  },

  async update(id: string, payload: UpdateOrganizationUserPayload): Promise<OrganizationUser> {
    const { data } = await apiClient.put<ApiResponse<OrganizationUser>>(
      `/organization-users/${id}`,
      payload,
    );
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/organization-users/${id}`);
  },
};
