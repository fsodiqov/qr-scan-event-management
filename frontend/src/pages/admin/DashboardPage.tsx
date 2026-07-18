import { Button, Card, Col, List, Row, Space, Typography } from 'antd';
import {
  TeamOutlined,
  ImportOutlined,
  ExportOutlined,
  CalendarOutlined,
  ScanOutlined,
  PercentageOutlined,
  WarningOutlined,
  FieldTimeOutlined,
  ArrowRightOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScanResultTag } from '@/components/attendance/ScanResultTag';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { formatDateTime } from '@/utils/formatDate';
import { ROUTES } from '@/utils/constants';
import { useThemeTokens } from '@/contexts/ThemeContext';

export function DashboardPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { hasPermission } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity(undefined, 5);
  const { border, brand, chart, radius, shadow, semantic, text } = useThemeTokens();

  if (statsLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  const quickActions = [
    {
      key: 'scanner',
      visible: hasPermission(PERMISSIONS.ORG_ATTENDANCE_SCAN),
      to: ROUTES.SCANNER,
      icon: <ScanOutlined />,
      title: t('dashboard.quickScanner'),
      description: t('dashboard.quickScannerDesc'),
    },
    {
      key: 'participants',
      visible: hasPermission(PERMISSIONS.ORG_PARTICIPANTS_MANAGE),
      to: ROUTES.PARTICIPANTS,
      icon: <UserAddOutlined />,
      title: t('dashboard.quickParticipants'),
      description: t('dashboard.quickParticipantsDesc'),
    },
    {
      key: 'events',
      visible: hasPermission(PERMISSIONS.ORG_EVENTS_MANAGE) || hasPermission(PERMISSIONS.ORG_EVENTS_READ),
      to: ROUTES.EVENTS,
      icon: <CalendarOutlined />,
      title: t('dashboard.quickEvents'),
      description: t('dashboard.quickEventsDesc'),
    },
    {
      key: 'attendance',
      visible: hasPermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE),
      to: ROUTES.ATTENDANCE,
      icon: <FieldTimeOutlined />,
      title: t('dashboard.quickAttendance'),
      description: t('dashboard.quickAttendanceDesc'),
    },
  ].filter((action) => action.visible);

  return (
    <div className="dashboard-page">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title={t('dashboard.totalParticipants')}
            value={stats?.totalParticipants ?? 0}
            icon={<TeamOutlined />}
            color={chart.teal}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title={t('dashboard.checkedIn')}
            value={stats?.checkedIn ?? 0}
            icon={<ImportOutlined />}
            color={semantic.success}
            colorValue
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title={t('dashboard.checkedOut')}
            value={stats?.checkedOut ?? 0}
            icon={<ExportOutlined />}
            color={chart.orange}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title={t('dashboard.checkInRate')}
            value={stats?.checkInRate ?? 0}
            suffix="%"
            icon={<PercentageOutlined />}
            color={chart.purple}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title={t('dashboard.activeEvents')}
            value={stats?.activeEvents ?? 0}
            icon={<CalendarOutlined />}
            color={semantic.info}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <StatCard
            title={t('dashboard.invalidScansToday')}
            value={stats?.invalidScansToday ?? 0}
            icon={<WarningOutlined />}
            color={(stats?.invalidScansToday ?? 0) > 0 ? semantic.error : text.secondary}
            colorValue={(stats?.invalidScansToday ?? 0) > 0}
          />
        </Col>
      </Row>

      {quickActions.length > 0 && (
        <div style={{ marginTop: isMobile ? 24 : 32 }}>
          <Typography.Title
            level={5}
            style={{
              margin: '0 0 16px',
              fontWeight: 600,
              color: text.primary,
              letterSpacing: '-0.01em',
            }}
          >
            {t('dashboard.quickActions')}
          </Typography.Title>
          <Row gutter={[16, 16]}>
            {quickActions.map((action) => (
              <Col xs={24} sm={12} lg={6} key={action.key}>
                <Link to={action.to} style={{ display: 'block', height: '100%' }}>
                  <Card
                    className="dashboard-quick-action"
                    bordered={false}
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: radius.card,
                      border: `1px solid ${border.default}`,
                      boxShadow: shadow.small,
                    }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Space align="start" size={12}>
                      <div
                        aria-hidden
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          color: brand.primary,
                          background: brand.primarySoft,
                          flexShrink: 0,
                        }}
                      >
                        {action.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Typography.Text
                          strong
                          style={{ display: 'block', color: text.primary, fontSize: 14 }}
                        >
                          {action.title}
                        </Typography.Text>
                        <Typography.Text
                          style={{
                            display: 'block',
                            marginTop: 4,
                            fontSize: 13,
                            color: text.secondary,
                            lineHeight: 1.4,
                          }}
                        >
                          {action.description}
                        </Typography.Text>
                      </div>
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Card
        className="dashboard-activity"
        bordered={false}
        style={{
          marginTop: isMobile ? 24 : 32,
          borderRadius: radius.card,
          border: `1px solid ${border.default}`,
          boxShadow: shadow.small,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 20px',
            borderBottom: `1px solid ${border.divider}`,
          }}
        >
          <div>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                fontWeight: 600,
                color: text.primary,
                letterSpacing: '-0.01em',
              }}
            >
              {t('dashboard.recentActivity')}
            </Typography.Title>
            <Typography.Text style={{ fontSize: 13, color: text.secondary }}>
              {t('dashboard.recentActivityHint')}
            </Typography.Text>
          </div>
          {hasPermission(PERMISSIONS.ORG_ATTENDANCE_MANAGE) && (
            <Link to={ROUTES.ATTENDANCE}>
              <Button type="link" size="small">
                {t('dashboard.viewAll')} <ArrowRightOutlined />
              </Button>
            </Link>
          )}
        </div>

        {recentLoading ? (
          <div style={{ padding: 24 }}>
            <LoadingSpinner tip={t('common.loading')} />
          </div>
        ) : (
          <List
            className="dashboard-activity-list"
            size={isMobile ? 'small' : 'default'}
            dataSource={recent?.items ?? []}
            locale={{ emptyText: t('dashboard.noRecentScans') }}
            split
            renderItem={(item) => (
              <List.Item
                className="dashboard-activity-row"
                extra={
                  <Typography.Text
                    style={{
                      fontSize: 12,
                      color: text.secondary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDateTime(item.scannedAt)}
                  </Typography.Text>
                }
              >
                <div className="dashboard-activity-main">
                  <div className="dashboard-activity-status">
                    <ScanResultTag result={item.result} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Typography.Text
                      style={{
                        display: 'block',
                        fontWeight: 600,
                        color: text.primary,
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.participantId?.name ?? t('common.unknown')}
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        display: 'block',
                        marginTop: 2,
                        fontSize: 13,
                        color: text.secondary,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.eventId?.title ?? t('common.event')}
                    </Typography.Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
