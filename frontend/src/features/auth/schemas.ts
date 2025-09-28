import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer').optional(),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  created_at: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type TokenResponse = z.infer<typeof tokenSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
