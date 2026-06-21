import dayjs from 'dayjs';
import i18n from '@/i18n';

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return i18n.t('common.empty');
  return dayjs(value).format('DD MMM YYYY, HH:mm');
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return i18n.t('common.empty');
  return dayjs(value).format('DD MMM YYYY');
}

export function toIsoDate(value: dayjs.Dayjs | null): string | undefined {
  return value ? value.toISOString() : undefined;
}
