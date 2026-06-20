import { Empty } from 'antd';

interface EmptyStateProps {
  description?: string;
}

export function EmptyState({ description = 'No data found' }: EmptyStateProps) {
  return (
    <div style={{ padding: 48 }}>
      <Empty description={description} />
    </div>
  );
}
