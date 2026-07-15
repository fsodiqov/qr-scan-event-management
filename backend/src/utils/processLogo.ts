import sharp from 'sharp';
import { BadRequestError } from './AppError';

export const LOGO_OUTPUT_SIZE = 100;
export const LOGO_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function circleMaskSvg(size: number): Buffer {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`,
  );
}

/**
 * Resize to 100×100, circular crop, and compress as PNG data URI
 * (organization logos and user profile photos).
 */
export async function processLogoToDataUri(input: Buffer): Promise<string> {
  try {
    const size = LOGO_OUTPUT_SIZE;
    const circular = await sharp(input)
      .rotate()
      .resize(size, size, {
        fit: 'cover',
        position: 'centre',
      })
      .composite([
        {
          input: circleMaskSvg(size),
          blend: 'dest-in',
        },
      ])
      .png({
        compressionLevel: 9,
        quality: 70,
        effort: 10,
      })
      .toBuffer();

    return `data:image/png;base64,${circular.toString('base64')}`;
  } catch {
    throw new BadRequestError('Invalid or unsupported image file');
  }
}

export async function processLogoFromDataUriOrUrl(value: string): Promise<string> {
  const trimmed = value.trim();

  if (trimmed.startsWith('data:image/')) {
    const comma = trimmed.indexOf(',');
    if (comma < 0) {
      throw new BadRequestError('Invalid logo image data');
    }
    const base64 = trimmed.slice(comma + 1);
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.byteLength === 0) {
      throw new BadRequestError('Invalid logo image data');
    }
    if (buffer.byteLength > LOGO_MAX_UPLOAD_BYTES) {
      throw new BadRequestError('Logo file is too large (max 20MB)');
    }
    return processLogoToDataUri(buffer);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BadRequestError('Logo must be a valid image URL or image upload');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError('Logo URL must use http or https');
  }

  const response = await fetch(trimmed, {
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new BadRequestError('Failed to download logo from URL');
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType && !contentType.startsWith('image/')) {
    throw new BadRequestError('Logo URL must point to an image');
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > LOGO_MAX_UPLOAD_BYTES) {
    throw new BadRequestError('Logo file is too large (max 20MB)');
  }

  return processLogoToDataUri(Buffer.from(arrayBuffer));
}
