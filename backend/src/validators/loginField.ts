import { z } from 'zod';

export const loginFieldSchema = z
  .string()
  .trim()
  .min(1, 'Login is required')
  .max(255);
