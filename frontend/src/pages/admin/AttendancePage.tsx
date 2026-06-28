import { useMemo, useState } from 'react';
import { Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { AttendanceStatusTag } from '@/components/attendance/AttendanceStatusTag';
import { useAttendance } from '@/hooks/useAttendance';
import { useEvents } from '@/hooks/useEvents';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { formatDateTime } from '@/utils/formatDate';
import { getEntityName } from '@/utils/helpers';
import type { Attendance, AttendanceStatus } from '@/types';

export function AttendancePage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { attendanceStatusOptions } = useStatusLabels();
  const [page, setPage] = useState(1);
  const [eventId, setEventId] = useState<string | undefined>();
  const [status, setStatus] = useState<AttendanceStatus | undefined>();

  const params = useMemo(
    () => ({ page, limit: 10, eventId, status }),
    [page, eventId, status],
  );

  const { data, isLoading } = useAttendance(params);
  const { data: eventsData } = useEvents({ limit: 100 });

  const columns: ColumnsType<Attendance> = [
    {
      title: t('common.participant'),
      key: 'participant',
      render: (_, record) => getEntityName(record.participantId),
    },
    {
      title: t('common.event'),
      key: 'event',
      responsive: ['md'],
      render: (_, record) => getEntityName(record.eventId),
    },
    {
      title: t('attendance.checkIn'),
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (value) => formatDateTime(value),
    },
    {
      title: t('attendance.checkOut'),
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      responsive: ['md'],
      render: (value) => formatDateTime(value),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: AttendanceStatus) => <AttendanceStatusTag status={value} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('attendance.title')}
        subtitle={t('attendance.subtitle')}
      />

      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Select
          allowClear
          placeholder={t('attendance.filterEvent')}
          style={{ width: '100%', maxWidth: 260 }}
          value={eventId}
          onChange={(value) => {
            setPage(1);
            setEventId(value);
          }}
          options={(eventsData?.events ?? []).map((event) => ({
            value: event._id,
            label: event.title,
          }))}
        />
        <Select
          allowClear
          placeholder={t('attendance.filterStatus')}
          style={{ width: '100%', maxWidth: 200 }}
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
          options={attendanceStatusOptions()}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.records ?? []}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.meta?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
          simple: isMobile,
        }}
      />
    </div>
  );
}
