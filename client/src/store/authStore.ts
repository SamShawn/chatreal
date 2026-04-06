import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthStore } from '../types';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,

      // Actions
      setUser: (user: User | null) =>
        set(() => ({
          user,
          isAuthenticated: user !== null,
        })),

      logout: () =>
        set(() => ({
          user: null,
          isAuthenticated: false,
        })),
    }),
    {
      name: 'chatreal-auth', // localStorage key
    }
  )
);