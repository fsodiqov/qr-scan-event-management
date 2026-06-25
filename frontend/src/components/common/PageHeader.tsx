import { Typography } from 'antd';
import type { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isMobile ? 16 : 24,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary" style={{ wordBreak: 'break-word' }}>
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && (
        <div style={{ width: isMobile ? '100%' : undefined }}>
          {extra}
        </div>
      )}
    </div>
  );
}
