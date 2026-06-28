import { Col, Row } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  LoginOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/dashboard/StatCard';
import { usePlatformDashboardStats } from '@/hooks/usePlatformDashboard';

export function PlatformDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = usePlatformDashboardStats();

  if (isLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div>
      <PageHeader
        title={t('platformDashboard.title')}
        subtitle={t('platformDashboard.subtitle')}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('platformDashboard.totalOrganizations')}
            value={stats?.totalOrganizations ?? 0}
            icon={<BankOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('platformDashboard.activeOrganizations')}
            value={stats?.activeOrganizations ?? 0}
            icon={<BankOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('platformDashboard.totalSubscriptions')}
            value={stats?.totalSubscriptions ?? 0}
            icon={<CreditCardOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('platformDashboard.totalEvents')}
            value={stats?.totalEvents ?? 0}
            icon={<CalendarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('platformDashboard.totalParticipants')}
            value={stats?.totalParticipants ?? 0}
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('platformDashboard.totalAttendance')}
            value={stats?.totalAttendanceRecords ?? 0}
            icon={<LoginOutlined />}
            color="#1677ff"
          />
        </Col>
      </Row>
    </div>
  );
}
