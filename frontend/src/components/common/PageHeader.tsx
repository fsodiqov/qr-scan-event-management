import { Typography } from 'antd';
import type { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useThemeTokens } from '@/contexts/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  const isMobile = useIsMobile();
  const { text } = useThemeTokens();

  return (
    <div
      className="page-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isMobile ? 24 : 32,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Typography.Title
          level={isMobile ? 4 : 3}
          style={{
            margin: 0,
            color: text.primary,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text
            style={{
              display: 'block',
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.5,
              color: text.secondary,
              wordBreak: 'break-word',
            }}
          >
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && (
        <div style={{ width: isMobile ? '100%' : undefined, flexShrink: 0 }}>
          {extra}
        </div>
      )}
    </div>
  );
}
