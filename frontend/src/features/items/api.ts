import { apiClient } from '@/lib/api';
import {
  createItemSchema,
  itemListSchema,
  itemSchema,
  updateItemSchema,
  type CreateItemInput,
  type Item,
  type UpdateItemInput,
} from './schemas';

export const listItems = async (): Promise<Item[]> => {
  return apiClient.get<Item[]>('/items', itemListSchema);
};

export const createItem = async (input: CreateItemInput): Promise<Item> => {
  const payload = createItemSchema.parse(input);
  return apiClient.post<Item, CreateItemInput>('/items', payload, itemSchema);
};

export const updateItem = async (id: string, input: UpdateItemInput): Promise<Item> => {
  const payload = updateItemSchema.parse(input);
  return apiClient.patch<Item, UpdateItemInput>(`/items/${id}`, payload, itemSchema);
};

export const deleteItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/items/${id}`);
};
