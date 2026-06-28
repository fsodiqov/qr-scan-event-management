import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

export function PlatformSettingsPage() {
  return <Navigate to={ROUTES.ACCOUNT_SETTINGS} replace />;
}
