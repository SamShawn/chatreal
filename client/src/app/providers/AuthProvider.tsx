import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAccessToken, clearAccessToken } from '../../lib/api/client';
import { authApi, type SafeUser, type AuthResponse } from '../../lib/api/endpoints';

interface AuthContextValue {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        // Try to refresh token
        const response = await authApi.refresh();
        handleAuthSuccess(response);
      } catch {
        // No valid session
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (data: AuthResponse): void => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    setError(null);
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      handleAuthSuccess(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register({ email, username, password });
      handleAuthSuccess(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    // Clear local state immediately to prevent re-renders with stale auth
    clearAccessToken();
    setUser(null);

    try {
      await authApi.logout();
    } catch {
      // Logout failed server-side, but local state is already cleared
      // The user will be treated as logged out locally
    }
  };

  const updateProfile = async (data: { username?: string; avatar?: string }): Promise<void> => {
    try {
      const response = await authApi.updateProfile(data);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
