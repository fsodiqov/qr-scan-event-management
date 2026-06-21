import { useTranslation } from 'react-i18next';
import type { AttendanceStatus, EventStatus, ScanResult } from '@/types';

export function useStatusLabels() {
  const { t } = useTranslation();

  return {
    eventStatus: (status: EventStatus) => t(`status.event.${status}`),
    attendanceStatus: (status: AttendanceStatus) => t(`status.attendance.${status}`),
    scanResult: (result: ScanResult) => t(`status.scan.${result}`),
    eventStatusOptions: (): { value: EventStatus; label: string }[] => [
      { value: 'draft', label: t('status.event.draft') },
      { value: 'active', label: t('status.event.active') },
      { value: 'closed', label: t('status.event.closed') },
    ],
    attendanceStatusOptions: (): { value: AttendanceStatus; label: string }[] => [
      { value: 'checked_in', label: t('status.attendance.checked_in') },
      { value: 'checked_out', label: t('status.attendance.checked_out') },
    ],
  };
}
