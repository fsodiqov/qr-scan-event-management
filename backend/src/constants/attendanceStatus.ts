export const ATTENDANCE_STATUS = {
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const SCAN_RESULT = {
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out',
  ALREADY_OUT: 'already_out',
  INVALID: 'invalid',
} as const;

export type ScanResult = (typeof SCAN_RESULT)[keyof typeof SCAN_RESULT];
