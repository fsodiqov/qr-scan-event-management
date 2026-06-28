import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

function LegacyUserRedirect({ to }: { to: (id: string) => string }) {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to={ROUTES.PARTICIPANTS} replace />;
  return <Navigate to={to(id)} replace />;
}

export function LegacyUserEditRedirect() {
  return <LegacyUserRedirect to={ROUTES.PARTICIPANT_EDIT} />;
}

export function LegacyUserQrRedirect() {
  return <LegacyUserRedirect to={ROUTES.PARTICIPANT_QR} />;
}
