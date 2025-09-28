import { z } from 'zod';

export const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  owner_id: z.string().uuid(),
  created_at: z.string(),
});

export const itemListSchema = z.array(itemSchema);

export const createItemSchema = z.object({
  name: z.string().min(1),
});

export const updateItemSchema = createItemSchema.partial();

export type Item = z.infer<typeof itemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
