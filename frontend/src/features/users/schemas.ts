import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'user']);

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: userRoleSchema,
  created_at: z.string(),
});

export const userListSchema = z.array(userSchema);

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema,
});

export const updateUserSchema = createUserSchema.partial();

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
