import dayjs from 'dayjs';

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY, HH:mm');
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY');
}

export function toIsoDate(value: dayjs.Dayjs | null): string | undefined {
  return value ? value.toISOString() : undefined;
}
