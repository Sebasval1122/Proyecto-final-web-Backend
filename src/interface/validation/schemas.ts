import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['admin', 'dealer', 'user']).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const userIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const paginationQuerySchema = z.object({
  limit: z.string().regex(/^[0-9]+$/).optional(),
  offset: z.string().regex(/^[0-9]+$/).optional()
});
