import { Tag } from 'antd';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import type { AttendanceStatus } from '@/types';

const COLORS: Record<AttendanceStatus, string> = {
  checked_in: 'green',
  checked_out: 'blue',
};

interface AttendanceStatusTagProps {
  status: AttendanceStatus;
}

export function AttendanceStatusTag({ status }: AttendanceStatusTagProps) {
  const { attendanceStatus } = useStatusLabels();

  return <Tag color={COLORS[status]}>{attendanceStatus(status)}</Tag>;
}
