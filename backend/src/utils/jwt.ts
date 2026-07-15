import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

export function signToken(payload: JwtPayload, expiresIn = env.JWT_EXPIRES_IN): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
