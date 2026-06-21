import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  description?: string;
}

export function EmptyState({ description }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div style={{ padding: 48 }}>
      <Empty description={description ?? t('common.noData')} />
    </div>
  );
}
