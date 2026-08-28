import type { ZodType } from 'zod';
import { AppError } from '../middleware/errorHandler.js';

export function parseBody<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request body';
    throw new AppError(message, 400);
  }

  return result.data;
}
