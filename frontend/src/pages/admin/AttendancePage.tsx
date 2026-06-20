import { useMemo, useState } from 'react';
import { Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { AttendanceStatusTag } from '@/components/attendance/AttendanceStatusTag';
import { useAttendance } from '@/hooks/useAttendance';
import { useEvents } from '@/hooks/useEvents';
import { formatDateTime } from '@/utils/formatDate';
import { getEntityName } from '@/utils/helpers';
import type { Attendance, AttendanceStatus } from '@/types';

export function AttendancePage() {
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
      title: 'Participant',
      key: 'user',
      render: (_, record) => getEntityName(record.userId),
    },
    {
      title: 'Event',
      key: 'event',
      render: (_, record) => getEntityName(record.eventId),
    },
    {
      title: 'Check In',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (value) => formatDateTime(value),
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (value) => formatDateTime(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: AttendanceStatus) => <AttendanceStatusTag status={value} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance Logs"
        subtitle="View check-in and check-out records"
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Filter by event"
          style={{ width: 260 }}
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
          placeholder="Filter by status"
          style={{ width: 180 }}
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
          options={[
            { value: 'checked_in', label: 'Checked In' },
            { value: 'checked_out', label: 'Checked Out' },
          ]}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.records ?? []}
        pagination={{
          current: page,
          pageSize: 10,
          total: data?.meta?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
