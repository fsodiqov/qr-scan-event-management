import { Role } from '../constants/roles';

export interface JwtPayload {
  sub: string;
  role: Role;
  email?: string;
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
