import { Tag } from 'antd';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { attendanceStatusColors } from '@/theme/statusColors';
import type { AttendanceStatus } from '@/types';

interface AttendanceStatusTagProps {
  status: AttendanceStatus;
}

export function AttendanceStatusTag({ status }: AttendanceStatusTagProps) {
  const { attendanceStatus } = useStatusLabels();

  return (
    <Tag className="status-badge" color={attendanceStatusColors[status]}>
      {attendanceStatus(status)}
    </Tag>
  );
}
