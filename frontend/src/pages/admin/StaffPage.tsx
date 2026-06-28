import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

export function StaffPage() {
  return <Navigate to={ROUTES.ORG_USERS} replace />;
}
