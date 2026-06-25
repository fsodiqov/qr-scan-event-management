import { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app') || hostname === 'vercel.app';
  } catch {
    return false;
  }
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
