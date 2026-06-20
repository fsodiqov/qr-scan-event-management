import { Col, List, Row, Typography } from 'antd';
import {
  TeamOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/dashboard/StatCard';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboard';
import { formatDateTime } from '@/utils/formatDate';
import { SCAN_RESULT_LABELS } from '@/utils/constants';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of participants and attendance activity"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Participants"
            value={stats?.totalParticipants ?? 0}
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Checked In"
            value={stats?.checkedIn ?? 0}
            icon={<LoginOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Checked Out"
            value={stats?.checkedOut ?? 0}
            icon={<LogoutOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Currently Inside"
            value={stats?.currentlyInside ?? 0}
            icon={<UserOutlined />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      <Typography.Title level={4} style={{ marginTop: 32 }}>
        Recent Activity
      </Typography.Title>

      {recentLoading ? (
        <LoadingSpinner />
      ) : (
        <List
          bordered
          dataSource={recent?.items ?? []}
          locale={{ emptyText: 'No recent scans' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`${SCAN_RESULT_LABELS[item.result] ?? item.result} — ${item.userId?.name ?? 'Unknown'}`}
                description={`${item.eventId?.title ?? 'Event'} · ${formatDateTime(item.scannedAt)}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
