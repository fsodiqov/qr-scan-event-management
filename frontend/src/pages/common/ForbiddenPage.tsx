import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultRouteForRole } from '@/utils/authRedirect';

export function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <Result
      status="403"
      title={t('forbidden.title')}
      subTitle={t('forbidden.subtitle')}
      extra={
        <Button type="primary" onClick={() => navigate(getDefaultRouteForRole(role))}>
          {t('forbidden.backHome')}
        </Button>
      }
    />
  );
}
