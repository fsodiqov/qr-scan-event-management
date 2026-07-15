import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ExportCsvButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  className?: string;
}

/** Shared toolbar/header CSV export control for paginated tables. */
export function ExportCsvButton({
  onClick,
  loading,
  disabled,
  block,
  className,
}: ExportCsvButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      block={block}
      className={`export-csv-btn${className ? ` ${className}` : ''}`}
      aria-label={t('common.exportCsv')}
    >
      {t('common.exportCsv')}
    </Button>
  );
}
