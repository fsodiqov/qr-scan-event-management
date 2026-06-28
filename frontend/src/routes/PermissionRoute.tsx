import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Permission } from '@/constants/permissions';
import { ROUTES } from '@/utils/constants';

interface PermissionRouteProps {
  permission: Permission;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(permission)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
