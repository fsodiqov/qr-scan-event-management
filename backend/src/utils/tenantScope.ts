import { Types } from 'mongoose';
import { AuthContext } from '../types';
import { isPlatformRole } from '../constants/roles';

export function scopeToOrganization(
  auth: AuthContext,
  filter: Record<string, unknown> = {},
): Record<string, unknown> {
  if (isPlatformRole(auth.role) || !auth.organizationId) {
    return filter;
  }

  return {
    ...filter,
    organizationId: new Types.ObjectId(auth.organizationId),
  };
}

export function requireOrganizationId(auth: AuthContext): string {
  if (!auth.organizationId) {
    throw new Error('Organization context is required');
  }
  return auth.organizationId;
}

export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}
