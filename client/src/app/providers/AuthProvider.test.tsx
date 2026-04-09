import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import { mockAuthResponse, mockUser } from '@/test/mocks/api';
import { setAccessToken, clearAccessToken } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';

// Test component to access auth context
function AuthConsumer() {
  const { user, isAuthenticated, isLoading, error, login, register, logout } = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="is-loading">{isLoading.toString()}</span>
      <span data-testid="user-id">{user?.id || 'null'}</span>
      <span data-testid="error">{error || 'null'}</span>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'username', 'password')}>Register</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

vi.mock('@/lib/api/endpoints');
vi.mock('@/lib/api/client');

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('No session'));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should start with null user and not authenticated', async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
        expect(screen.getByTestId('user-id').textContent).toBe('null');
      });
    });

    it('should start with isLoading true during initial auth check', () => {
      vi.mocked(authApi.refresh).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading
      );

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-loading').textContent).toBe('true');
    });
  });

  describe('login', () => {
    it('should authenticate user on successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
        expect(screen.getByTestId('user-id').textContent).toBe(mockUser.id);
      });
    });

    it('should set error on failed login', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
      });

      expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    });
  });

  describe('register', () => {
    it('should authenticate user on successful registration', async () => {
      vi.mocked(authApi.register).mockResolvedValue(mockAuthResponse);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
      });
    });
  });

  describe('logout', () => {
    it('should clear user on logout', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
        expect(screen.getByTestId('user-id').textContent).toBe('null');
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<AuthConsumer />);
      }).toThrow('useAuth must be used within AuthProvider');

      consoleError.mockRestore();
    });
  });
});
