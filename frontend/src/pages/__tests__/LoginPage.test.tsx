import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { LoginPage } from '@/pages/LoginPage';
import { AuthContext } from '@/features/auth/auth-context';
import type { AuthUser } from '@/features/auth/schemas';

const createAuthContextValue = () => ({
  user: null as AuthUser | null,
  token: null as string | null,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
});

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <AuthContext.Provider value={createAuthContextValue()}>
        <LoginPage />
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
