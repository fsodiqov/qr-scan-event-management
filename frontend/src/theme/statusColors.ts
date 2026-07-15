import type { AttendanceStatus, EventStatus } from '@/types';
import { brand, scanner, semantic, status } from './tokens';

export const eventStatusColors: Record<EventStatus, string> = {
  draft: status.draft,
  active: status.online,
  closed: status.cancelled,
};

export const attendanceStatusColors: Record<AttendanceStatus, string> = {
  checked_in: semantic.success,
  checked_out: status.completed,
};

export const userActiveColors = {
  active: status.online,
  inactive: status.offline,
} as const;

export const orgStatusColors = {
  active: status.online,
  inactive: status.cancelled,
} as const;

export const subscriptionStatusColors = {
  active: status.online,
  inactive: status.offline,
} as const;

export const scanResultColors = {
  check_in: scanner.checkInSuccess,
  check_out: status.completed,
  already_out: scanner.alreadyCheckedOut,
  invalid: scanner.invalidQr,
} as const;

export const roleTagColors = {
  superAdmin: semantic.info,
  default: brand.primary,
} as const;
