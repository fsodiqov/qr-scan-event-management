import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon?: ReactNode;
  color?: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={color ? { color } : undefined}
      />
    </Card>
  );
}
