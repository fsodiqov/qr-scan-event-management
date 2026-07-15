import { useMemo, useState } from 'react';
import {
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Select,
  Segmented,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  TeamOutlined,
  ImportOutlined,
  ExportOutlined,
  PercentageOutlined,
  ScanOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ExportCsvButton } from '@/components/common/ExportCsvButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceStatusTag } from '@/components/attendance/AttendanceStatusTag';
import { attendanceApi } from '@/api';
import { useDashboardReport } from '@/hooks/useDashboard';
import { useAttendance } from '@/hooks/useAttendance';
import { useEvents } from '@/hooks/useEvents';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { fetchAllForExport, useCsvExport } from '@/hooks/useCsvExport';
import { formatDateTime } from '@/utils/formatDate';
import { getEntityName } from '@/utils/helpers';
import { tablePagination } from '@/utils/tablePagination';
import { brand, chart, semantic, status } from '@/theme/tokens';
import type { Attendance, AttendanceStatus, ReportPeriod } from '@/types';

type RangeValue = [Dayjs | null, Dayjs | null] | null;

export function ReportsPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { attendanceStatus, scanResult } = useStatusLabels();
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [eventId, setEventId] = useState<string | undefined>();
  const [customRange, setCustomRange] = useState<RangeValue>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { exporting, runExport } = useCsvExport();

  const rangeParams = useMemo(() => {
    if (period === 'custom' && customRange?.[0] && customRange?.[1]) {
      return {
        period: 'custom' as const,
        from: customRange[0].startOf('day').toISOString(),
        to: customRange[1].endOf('day').toISOString(),
      };
    }
    return { period: period === 'custom' ? ('week' as const) : period };
  }, [period, customRange]);

  const reportParams = useMemo(
    () => ({
      eventId,
      ...rangeParams,
    }),
    [eventId, rangeParams],
  );

  const customReady = period !== 'custom' || Boolean(customRange?.[0] && customRange?.[1]);

  const { data: report, isLoading: reportLoading } = useDashboardReport(
    reportParams,
    customReady,
  );

  const attendanceParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      eventId,
      from: report?.from,
      to: report?.to,
    }),
    [page, pageSize, eventId, report?.from, report?.to],
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance(
    attendanceParams,
    customReady && Boolean(report?.from),
  );
  const { data: eventsData } = useEvents({ limit: 100 });

  const stats = report?.stats;
  const trend = report?.trend ?? [];
  const maxTrend = Math.max(1, ...trend.map((point) => point.scans));
  const byResult = report?.byResult;
  const resultTotal = byResult
    ? byResult.check_in + byResult.check_out + byResult.already_out + byResult.invalid
    : 0;

  const columns: ColumnsType<Attendance> = [
    {
      title: t('common.participant'),
      key: 'participant',
      render: (_, record) => (
        <Typography.Text className="reports-cell-primary">
          {getEntityName(record.participantId)}
        </Typography.Text>
      ),
    },
    {
      title: t('common.event'),
      key: 'event',
      responsive: ['md'],
      render: (_, record) => (
        <Typography.Text className="reports-cell-secondary">
          {getEntityName(record.eventId)}
        </Typography.Text>
      ),
    },
    {
      title: t('attendance.checkIn'),
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (value) => (
        <Typography.Text className="reports-cell-datetime">
          {formatDateTime(value)}
        </Typography.Text>
      ),
    },
    {
      title: t('attendance.checkOut'),
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      responsive: ['lg'],
      render: (value) => (
        <Typography.Text className="reports-cell-datetime">
          {value ? formatDateTime(value) : t('common.empty')}
        </Typography.Text>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: AttendanceStatus) => <AttendanceStatusTag status={value} />,
    },
  ];

  const handleExport = () => {
    if (!report) return;
    void runExport(async () => {
      const records = await fetchAllForExport(async (exportPage, limit) => {
        const result = await attendanceApi.list({
          page: exportPage,
          limit,
          eventId,
          from: report.from,
          to: report.to,
        });
        return {
          items: result.records,
          total: result.meta?.total ?? result.records.length,
        };
      });

      return {
        filenamePrefix: 'attendance-report',
        headers: [
          t('common.participant'),
          t('common.event'),
          t('attendance.checkIn'),
          t('attendance.checkOut'),
          t('common.status'),
        ],
        rows: records.map((record) => [
          getEntityName(record.participantId),
          getEntityName(record.eventId),
          record.checkInTime ? formatDateTime(record.checkInTime) : '',
          record.checkOutTime ? formatDateTime(record.checkOutTime) : '',
          attendanceStatus(record.status),
        ]),
      };
    });
  };

  if (reportLoading && !report) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div className="reports-page">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        extra={
          <ExportCsvButton
            onClick={handleExport}
            loading={exporting}
            disabled={!report}
            block={isMobile}
            className="reports-export-btn"
          />
        }
      />

      <div className="reports-toolbar">
        <Segmented
          value={period}
          onChange={(value) => {
            setPeriod(value as ReportPeriod);
            setPage(1);
          }}
          options={[
            { label: t('reports.period.day'), value: 'day' },
            { label: t('reports.period.week'), value: 'week' },
            { label: t('reports.period.month'), value: 'month' },
            { label: t('reports.period.custom'), value: 'custom' },
          ]}
        />

        {period === 'custom' && (
          <DatePicker.RangePicker
            value={customRange}
            onChange={(value) => {
              setCustomRange(value);
              setPage(1);
            }}
            allowClear={false}
            className="reports-range-picker"
          />
        )}

        <Select
          allowClear
          placeholder={t('reports.filterEvent')}
          className="reports-event-filter"
          value={eventId}
          onChange={(value) => {
            setEventId(value);
            setPage(1);
          }}
          options={(eventsData?.events ?? []).map((event) => ({
            value: event._id,
            label: event.title,
          }))}
          aria-label={t('reports.filterEvent')}
        />
      </div>

      {stats && (
        <Row gutter={[16, 16]} className="reports-stats">
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title={t('dashboard.totalParticipants')}
              value={stats.totalParticipants}
              icon={<TeamOutlined />}
              color={brand.primary}
            />
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title={t('dashboard.checkedIn')}
              value={stats.checkedIn}
              icon={<ImportOutlined />}
              color={semantic.success}
            />
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title={t('dashboard.checkedOut')}
              value={stats.checkedOut}
              icon={<ExportOutlined />}
              color={status.completed}
            />
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title={t('dashboard.checkInRate')}
              value={stats.checkInRate}
              suffix="%"
              icon={<PercentageOutlined />}
              color={brand.primary}
            />
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title={t('reports.scansInPeriod')}
              value={stats.scansToday}
              icon={<ScanOutlined />}
              color={brand.primary}
            />
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard
              title={t('reports.invalidInPeriod')}
              value={stats.invalidScansToday}
              icon={<WarningOutlined />}
              color={semantic.error}
            />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} className="reports-charts">
        <Col xs={24} lg={14}>
          <Card className="reports-card" title={t('reports.trendTitle')}>
            <Typography.Text type="secondary" className="reports-card-hint">
              {t('reports.trendHint')}
            </Typography.Text>
            <div className="reports-trend" role="img" aria-label={t('reports.trendTitle')}>
              {trend.length === 0 ? (
                <Typography.Text type="secondary">{t('common.noData')}</Typography.Text>
              ) : (
                trend.map((point) => (
                  <div key={point.date} className="reports-trend-col">
                    <div className="reports-trend-bars">
                      <div
                        className="reports-trend-bar reports-trend-bar--scans"
                        style={{ height: `${(point.scans / maxTrend) * 100}%` }}
                        title={`${point.scans}`}
                      />
                    </div>
                    <span className="reports-trend-label">
                      {dayjs(point.date).format(isMobile ? 'D' : 'MMM D')}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="reports-trend-legend">
              <span>
                <i className="reports-legend-dot reports-legend-dot--scans" />
                {t('reports.scansInPeriod')}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="reports-card" title={t('reports.breakdownTitle')}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {(
                [
                  { key: 'check_in' as const, color: chart.green },
                  { key: 'check_out' as const, color: chart.blue },
                  { key: 'already_out' as const, color: chart.orange },
                  { key: 'invalid' as const, color: chart.red },
                ] as const
              ).map((item) => {
                const value = byResult?.[item.key] ?? 0;
                const percent = resultTotal > 0 ? Math.round((value / resultTotal) * 100) : 0;
                return (
                  <div key={item.key} className="reports-breakdown-row">
                    <div className="reports-breakdown-meta">
                      <Typography.Text strong>{scanResult(item.key)}</Typography.Text>
                      <Typography.Text type="secondary">
                        {value} · {percent}%
                      </Typography.Text>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor={item.color}
                      trailColor="#f1f5f9"
                      size="small"
                    />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card className="reports-card reports-table-card" title={t('reports.detailsTitle')}>
        <Table
          className="reports-table"
          rowKey="_id"
          loading={attendanceLoading}
          columns={columns}
          dataSource={attendanceData?.records ?? []}
          size={isMobile ? 'small' : 'middle'}
          scroll={{ x: 'max-content' }}
          pagination={tablePagination(
            page,
            pageSize,
            attendanceData?.meta?.total ?? 0,
            (nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            },
          )}
        />
      </Card>
    </div>
  );
}
