import { vi } from 'vitest';

export const setupLocalStorageMock = (initialStore: Record<string, string> = {}) => {
  let store = { ...initialStore };
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((i: number) => Object.keys(store)[i] || null),
    },
    writable: true,
  });
};

export const clearLocalStorageMock = () => {
  window.localStorage.clear();
  window.localStorage.getItem.mockClear();
  window.localStorage.setItem.mockClear();
  window.localStorage.removeItem.mockClear();
};
