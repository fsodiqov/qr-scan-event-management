import { apiClient } from './client';
import type {
  ApiResponse,
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  ListOrganizationsParams,
  ListOrganizationUsersParams,
  Organization,
  OrganizationUser,
  UpdateMyOrganizationPayload,
  UpdateOrganizationPayload,
  UpdateOrganizationUserPayload,
} from '@/types';

export const organizationsApi = {
  async list(params?: ListOrganizationsParams): Promise<{
    organizations: Organization[];
    meta?: ApiResponse<Organization[]>['meta'];
  }> {
    const { data } = await apiClient.get<ApiResponse<Organization[]>>('/organizations', {
      params,
    });
    return { organizations: data.data ?? [], meta: data.meta };
  },

  async getById(id: string): Promise<Organization> {
    const { data } = await apiClient.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return data.data!;
  },

  async create(payload: CreateOrganizationPayload): Promise<CreateOrganizationResponse> {
    const { data } = await apiClient.post<ApiResponse<CreateOrganizationResponse>>(
      '/organizations',
      payload,
    );
    return data.data!;
  },

  async update(id: string, payload: UpdateOrganizationPayload): Promise<Organization> {
    const { data } = await apiClient.put<ApiResponse<Organization>>(
      `/organizations/${id}`,
      payload,
    );
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`);
  },

  async getMe(): Promise<Organization> {
    const { data } = await apiClient.get<ApiResponse<Organization>>('/organizations/me');
    return data.data!;
  },

  async updateMe(payload: UpdateMyOrganizationPayload): Promise<Organization> {
    const { data } = await apiClient.put<ApiResponse<Organization>>('/organizations/me', payload);
    return data.data!;
  },

  async listMembers(
    organizationId: string,
    params?: ListOrganizationUsersParams,
  ): Promise<{
    members: OrganizationUser[];
    meta?: ApiResponse<OrganizationUser[]>['meta'];
  }> {
    const { data } = await apiClient.get<ApiResponse<OrganizationUser[]>>(
      `/organizations/${organizationId}/members`,
      { params },
    );
    return { members: data.data ?? [], meta: data.meta };
  },

  async updateMember(
    organizationId: string,
    memberId: string,
    payload: UpdateOrganizationUserPayload,
  ): Promise<OrganizationUser> {
    const { data } = await apiClient.put<ApiResponse<OrganizationUser>>(
      `/organizations/${organizationId}/members/${memberId}`,
      payload,
    );
    return data.data!;
  },
};
