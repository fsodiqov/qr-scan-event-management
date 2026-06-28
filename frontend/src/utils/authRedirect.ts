import type { Role } from '@/types';
import { ROUTES } from '@/utils/constants';

export function getDefaultRouteForRole(role: Role | null | undefined): string {
  if (role === 'super_admin') return ROUTES.PLATFORM_DASHBOARD;
  if (role === 'operator') return ROUTES.SCANNER;
  return ROUTES.DASHBOARD;
}
