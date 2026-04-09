import { vi } from 'vitest';
import type { SafeUser, AuthResponse } from '@/lib/api/endpoints';

export const mockUser: SafeUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  avatar: null,
  status: 'ONLINE',
  role: 'MEMBER',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockAuthResponse: AuthResponse = {
  user: mockUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const mockAuthApi = {
  register: vi.fn<() => Promise<AuthResponse>>().mockResolvedValue(mockAuthResponse),
  login: vi.fn<() => Promise<AuthResponse>>().mockResolvedValue(mockAuthResponse),
  logout: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  refresh: vi.fn<() => Promise<AuthResponse>>().mockResolvedValue(mockAuthResponse),
  me: vi.fn<() => Promise<{ user: SafeUser }>>().mockResolvedValue({ user: mockUser }),
  updateProfile: vi.fn<() => Promise<{ user: SafeUser }>>().mockResolvedValue({ user: mockUser }),
};

export const setupAuthApiMock = (overrides?: Partial<typeof mockAuthApi>) => {
  Object.assign(mockAuthApi, overrides);
  return mockAuthApi;
};

export const resetAuthApiMock = () => {
  mockAuthApi.register.mockClear().mockResolvedValue(mockAuthResponse);
  mockAuthApi.login.mockClear().mockResolvedValue(mockAuthResponse);
  mockAuthApi.logout.mockClear().mockResolvedValue(undefined);
  mockAuthApi.refresh.mockClear().mockResolvedValue(mockAuthResponse);
  mockAuthApi.me.mockClear().mockResolvedValue({ user: mockUser });
  mockAuthApi.updateProfile.mockClear().mockResolvedValue({ user: mockUser });
};
