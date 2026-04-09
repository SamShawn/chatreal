import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import App from '@/App';
import socketClient from '@/lib/socket/client';
import { authApi } from '@/lib/api/endpoints';

vi.mock('@/lib/socket/client');
vi.mock('@/lib/api/endpoints');
vi.mock('@/lib/api/client');

vi.mock('@/features/auth/components/LoginPage', () => ({
  LoginPage: ({ onNavigateToRegister }: { onNavigateToRegister: () => void }) => (
    <div data-testid="login-page">
      <button onClick={onNavigateToRegister}>Go to Register</button>
    </div>
  ),
}));

vi.mock('@/features/auth/components/RegisterPage', () => ({
  RegisterPage: ({ onNavigateToLogin }: { onNavigateToLogin: () => void }) => (
    <div data-testid="register-page">
      <button onClick={onNavigateToLogin}>Go to Login</button>
    </div>
  ),
}));

vi.mock('@/features/chat/components/ChatLayout', () => ({
  ChatLayout: () => <div data-testid="chat-layout">Chat Layout</div>,
}));

describe('App Provider Composition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(socketClient.isConnected).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('render flow', () => {
    it('should show loading state initially', async () => {
      vi.mocked(authApi.refresh).mockImplementation(
        () => new Promise(() => {})
      );

      render(<App />);

      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it('should render login page when not authenticated', async () => {
      vi.mocked(authApi.refresh).mockRejectedValue(new Error('No session'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should render chat layout when authenticated', async () => {
      vi.mocked(authApi.refresh).mockResolvedValue({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          avatar: null,
          status: 'ONLINE',
          role: 'MEMBER',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        accessToken: 'mock-token',
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('chat-layout')).toBeInTheDocument();
      });
    });
  });

  describe('page navigation', () => {
    it('should navigate from login to register', async () => {
      vi.mocked(authApi.refresh).mockRejectedValue(new Error('No session'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByText('Go to Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
      });
    });

    it('should navigate from register to login', async () => {
      vi.mocked(authApi.refresh).mockRejectedValue(new Error('No session'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByText('Go to Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByText('Go to Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });
});
