import { Button, Tooltip } from 'antd';
import { ScanOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/utils/constants';

export function ScannerFab() {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const canScan = hasPermission(PERMISSIONS.ORG_ATTENDANCE_SCAN);
  const isOnScanner = location.pathname === ROUTES.SCANNER;

  if (!canScan || isOnScanner) {
    return null;
  }

  return (
    <Tooltip title={t('nav.scanner')} placement="left">
      <Button
        type="primary"
        shape="circle"
        size="large"
        className="scanner-fab"
        icon={<ScanOutlined />}
        aria-label={t('nav.scanner')}
        onClick={() => navigate(ROUTES.SCANNER)}
      />
    </Tooltip>
  );
}
