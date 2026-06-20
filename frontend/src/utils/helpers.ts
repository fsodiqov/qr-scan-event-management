export function extractQrToken(decodedText: string): string | null {
  const trimmed = decodedText.trim();

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get('t');
    if (token) return token;
  } catch {
    // Not a URL — fall through
  }

  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/[?&]t=([a-f0-9]+)/i);
  return match?.[1] ?? null;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
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
  if (!value) return '—';
  if (typeof value === 'string') return value;
  return value.name ?? value.title ?? '—';
}
