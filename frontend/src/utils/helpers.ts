import i18n from '@/i18n';
import type { ApiErrorResponse } from '@/types';

export function extractQrToken(decodedText: string): string | null {
  const trimmed = decodedText.trim();

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get('t');
    if (token) return token;
  } catch {
    // Not a URL — fall through
  }

  if (/^[a-f0-9]{16,64}$/i.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/[?&]t=([a-f0-9]+)/i);
  return match?.[1] ?? null;
}

export function translateApiMessage(
  code?: string,
  message?: string,
  fallback?: string,
): string {
  if (code) {
    const translated = i18n.t(`errors.${code}`, { defaultValue: '' });
    if (translated) return translated;
  }

  if (message) {
    const messageKeyMap: Record<string, string> = {
      'Check-in successful': 'messages.CHECK_IN_SUCCESS',
      'Check-out successful': 'messages.CHECK_OUT_SUCCESS',
      'Already checked out': 'messages.ALREADY_CHECKED_OUT',
    };

    const mappedKey = messageKeyMap[message];
    if (mappedKey) {
      return i18n.t(mappedKey);
    }
  }

  return message ?? fallback ?? i18n.t('common.somethingWentWrong');
}

export function getApiErrorMessage(
  error: unknown,
  fallback?: string,
): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: { data?: ApiErrorResponse & { code?: string } };
    }).response;
    const data = response?.data;

    return translateApiMessage(
      data?.code,
      data?.message,
      fallback,
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? i18n.t('common.somethingWentWrong');
}

export function getEntityId(
  value: string | { _id: string } | undefined,
): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value._id;
}

export function getEntityName(
  value: string | { name?: string; title?: string } | undefined,
): string {
  if (!value) return i18n.t('common.empty');
  if (typeof value === 'string') return value;
  return value.name ?? value.title ?? i18n.t('common.empty');
}
