import { apiClient } from '@/lib/api';
import {
  createUserSchema,
  updateUserSchema,
  userListSchema,
  userSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
} from './schemas';

export const listUsers = async (): Promise<User[]> => {
  return apiClient.get<User[]>('/users', userListSchema);
};

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const payload = createUserSchema.parse(input);
  return apiClient.post<User, CreateUserInput>('/users', payload, userSchema);
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<User> => {
  const payload = updateUserSchema.parse(input);
  return apiClient.patch<User, UpdateUserInput>(`/users/${id}`, payload, userSchema);
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
