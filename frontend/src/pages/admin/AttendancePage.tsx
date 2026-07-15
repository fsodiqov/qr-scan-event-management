import { useMemo, useState } from 'react';
import { Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ExportCsvButton } from '@/components/common/ExportCsvButton';
import { AttendanceStatusTag } from '@/components/attendance/AttendanceStatusTag';
import { useAttendance } from '@/hooks/useAttendance';
import { useEvents } from '@/hooks/useEvents';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { fetchAllForExport, useCsvExport } from '@/hooks/useCsvExport';
import { formatDateTime } from '@/utils/formatDate';
import { getEntityName } from '@/utils/helpers';
import { tablePagination } from '@/utils/tablePagination';
import { attendanceApi } from '@/api';
import type { Attendance, AttendanceStatus } from '@/types';

export function AttendancePage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { attendanceStatusOptions, attendanceStatus } = useStatusLabels();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [eventId, setEventId] = useState<string | undefined>();
  const [status, setStatus] = useState<AttendanceStatus | undefined>();

  const params = useMemo(
    () => ({ page, limit: pageSize, eventId, status }),
    [page, pageSize, eventId, status],
  );

  const { data, isLoading } = useAttendance(params);
  const { data: eventsData } = useEvents({ limit: 100 });
  const { exporting, runExport } = useCsvExport();

  const handleExportCsv = () => {
    void runExport(async () => {
      const records = await fetchAllForExport(async (exportPage, limit) => {
        const result = await attendanceApi.list({
          page: exportPage,
          limit,
          eventId,
          status,
        });
        return {
          items: result.records,
          total: result.meta?.total ?? result.records.length,
        };
      });

      return {
        filenamePrefix: 'attendance',
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

  const columns: ColumnsType<Attendance> = [
    {
      title: t('common.participant'),
      key: 'participant',
      render: (_, record) => (
        <Typography.Text className="attendance-cell-primary">
          {getEntityName(record.participantId)}
        </Typography.Text>
      ),
    },
    {
      title: t('common.event'),
      key: 'event',
      responsive: ['md'],
      render: (_, record) => (
        <Typography.Text className="attendance-cell-secondary">
          {getEntityName(record.eventId)}
        </Typography.Text>
      ),
    },
    {
      title: t('attendance.checkIn'),
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (value) => (
        <Typography.Text className="attendance-cell-datetime">
          {formatDateTime(value)}
        </Typography.Text>
      ),
    },
    {
      title: t('attendance.checkOut'),
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      responsive: ['md'],
      render: (value) => (
        <Typography.Text className="attendance-cell-datetime">
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

  return (
    <div className="attendance-page">
      <PageHeader
        title={t('attendance.title')}
        subtitle={t('attendance.subtitle')}
      />

      <div className="attendance-toolbar">
        <Select
          allowClear
          placeholder={t('attendance.filterEvent')}
          className="attendance-toolbar-event"
          value={eventId}
          onChange={(value) => {
            setPage(1);
            setEventId(value);
          }}
          options={(eventsData?.events ?? []).map((event) => ({
            value: event._id,
            label: event.title,
          }))}
          aria-label={t('attendance.filterEvent')}
        />
        <Select
          allowClear
          placeholder={t('attendance.filterStatus')}
          className="attendance-toolbar-status"
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
          options={attendanceStatusOptions()}
          aria-label={t('attendance.filterStatus')}
        />
        <div className="table-toolbar-actions">
          <ExportCsvButton onClick={handleExportCsv} loading={exporting} block={isMobile} />
        </div>
      </div>

      <Table
        className="attendance-table"
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.records ?? []}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination(page, pageSize, data?.meta?.total ?? 0, (nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        })}
      />
    </div>
  );
}
