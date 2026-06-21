import crypto from 'crypto';
import { env } from '../config/env';

/** 8 bytes → 16 hex chars; enough entropy for attendance QR tokens */
const QR_TOKEN_BYTES = 8;

export const QR_TOKEN_HEX_LENGTH = QR_TOKEN_BYTES * 2;

export const QR_CODE_OPTIONS = {
  errorCorrectionLevel: 'M' as const,
  margin: 2,
  width: 300,
};

export function generateQrToken(): string {
  return crypto.randomBytes(QR_TOKEN_BYTES).toString('hex');
}

export function buildQrUrl(token: string): string {
  return `${env.APP_URL}/scan?t=${token}`;
}
