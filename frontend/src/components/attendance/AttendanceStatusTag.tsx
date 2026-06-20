import { Tag } from 'antd';
import { ATTENDANCE_STATUS_LABELS } from '@/utils/constants';
import type { AttendanceStatus } from '@/types';

const COLORS: Record<AttendanceStatus, string> = {
  checked_in: 'green',
  checked_out: 'blue',
};

interface AttendanceStatusTagProps {
  status: AttendanceStatus;
}

export function AttendanceStatusTag({ status }: AttendanceStatusTagProps) {
  return <Tag color={COLORS[status]}>{ATTENDANCE_STATUS_LABELS[status]}</Tag>;
}
