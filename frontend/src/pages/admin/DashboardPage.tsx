import { Col, List, Row, Typography } from 'antd';
import {
  TeamOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/dashboard/StatCard';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboard';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { formatDateTime } from '@/utils/formatDate';

export function DashboardPage() {
  const { t } = useTranslation();
  const { scanResult } = useStatusLabels();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();

  if (statsLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('dashboard.totalParticipants')}
            value={stats?.totalParticipants ?? 0}
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('dashboard.checkedIn')}
            value={stats?.checkedIn ?? 0}
            icon={<LoginOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('dashboard.checkedOut')}
            value={stats?.checkedOut ?? 0}
            icon={<LogoutOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('dashboard.currentlyInside')}
            value={stats?.currentlyInside ?? 0}
            icon={<UserOutlined />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      <Typography.Title level={4} style={{ marginTop: 32 }}>
        {t('dashboard.recentActivity')}
      </Typography.Title>

      {recentLoading ? (
        <LoadingSpinner tip={t('common.loading')} />
      ) : (
        <List
          bordered
          dataSource={recent?.items ?? []}
          locale={{ emptyText: t('dashboard.noRecentScans') }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`${scanResult(item.result)} — ${item.userId?.name ?? t('common.unknown')}`}
                description={`${item.eventId?.title ?? t('common.event')} · ${formatDateTime(item.scannedAt)}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
