import { Role } from '../constants/roles';

export interface JwtPayload {
  sub: string;
  organizationId?: string;
  role: Role;
  login?: string;
  phone?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export interface AuthContext {
  userId: string;
  organizationId?: string;
  role: Role;
}
