import { vi } from 'vitest';
import type { Socket } from 'socket.io-client';

export const createMockSocket = () => {
  const socket = {
    id: 'mock-socket-id',
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {}),
    off: vi.fn(),
    offAll: vi.fn(),
    isConnected: vi.fn().mockReturnValue(true),
  };
  return socket;
};

let mockSocketInstance = createMockSocket();

export const getMockSocket = () => mockSocketInstance;

export const resetMockSocket = () => {
  mockSocketInstance = createMockSocket();
};

export const setupSocketMock = (overrides?: Partial<typeof mockSocketInstance>) => {
  Object.assign(mockSocketInstance, overrides);
  return mockSocketInstance;
};
