import crypto from 'crypto';
import { env } from '../config/env';

export function generateQrToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function signQrPayload(token: string): string {
  return crypto.createHmac('sha256', env.QR_HMAC_SECRET).update(token).digest('hex');
}

export function buildQrUrl(token: string): string {
  const signature = signQrPayload(token);
  return `${env.APP_URL}/scan?t=${token}&s=${signature}`;
}

export function verifyQrSignature(token: string, signature: string): boolean {
  const expected = signQrPayload(token);
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex'),
  );
}
