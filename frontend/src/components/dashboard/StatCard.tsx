import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useThemeTokens } from '@/contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: number;
  icon?: ReactNode;
  color?: string;
  suffix?: string;
}

export function StatCard({ title, value, icon, color, suffix }: StatCardProps) {
  const { brand, border, radius, shadow, text } = useThemeTokens();
  const accent = color ?? brand.primary;

  return (
    <Card
      className="stat-card"
      bordered={false}
      style={{
        height: '100%',
        borderRadius: radius.card,
        border: `1px solid ${border.default}`,
        boxShadow: shadow.small,
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      styles={{
        body: {
          padding: 20,
          height: '100%',
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          minHeight: 72,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography.Text
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.4,
              color: text.secondary,
            }}
          >
            {title}
          </Typography.Text>
          <Typography.Text
            style={{
              display: 'block',
              marginTop: 8,
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: accent,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
            {suffix ? (
              <Typography.Text
                style={{
                  marginLeft: 2,
                  fontSize: 18,
                  fontWeight: 600,
                  color: accent,
                }}
              >
                {suffix}
              </Typography.Text>
            ) : null}
          </Typography.Text>
        </div>

        {icon && (
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: accent,
              background: `color-mix(in srgb, ${accent} 12%, var(--mix-surface))`,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
