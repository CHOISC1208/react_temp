import { apiClient } from '@/lib/api';
import { authUserSchema, loginSchema, tokenSchema, type AuthUser, type LoginInput, type TokenResponse } from './schemas';

export const loginRequest = async (input: LoginInput): Promise<TokenResponse> => {
  const payload = loginSchema.parse(input);
  return apiClient.post<TokenResponse, LoginInput>('/auth/login', payload, tokenSchema);
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  return apiClient.get<AuthUser>('/auth/me', authUserSchema);
};
