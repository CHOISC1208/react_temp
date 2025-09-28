import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, loginRequest } from './api';
import type { AuthUser, LoginInput } from './schemas';
import { setAuthTokenGetter } from '@/lib/api';
import { ApiError } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<AuthUser | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = 'template.auth.token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)));
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const {
    data: user,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (error && token) {
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      queryClient.clear();
    }
  }, [error, queryClient, token]);

  const handleLogin = async (input: LoginInput) => {
    try {
      const response = await loginRequest(input);
      const nextToken = response.access_token;
      setToken(nextToken);
      localStorage.setItem(TOKEN_KEY, nextToken);
      await refetch();
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message || 'Authentication failed');
      }
      throw err;
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
  };

  const refresh = async () => {
    const result = await refetch();
    return result.data ?? null;
  };

  const value: AuthContextValue = {
    user: user ?? null,
    token,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
