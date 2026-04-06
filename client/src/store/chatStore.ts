import { create } from 'zustand';
import type { User, Message, ChatStore } from '../types';

export const useChatStore = create<ChatStore>((set) => ({
  // State
  messages: [],
  onlineUsers: [],
  isConnected: false,
  isLoading: false,
  error: null,
  searchQuery: '',
  searchResults: [],
  showSearchResults: false,

  // Actions
  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages: Message[]) =>
    set(() => ({
      messages,
    })),

  setOnlineUsers: (users: User[]) =>
    set(() => ({
      onlineUsers: users,
    })),

  addUser: (user: User) =>
    set((state) => ({
      onlineUsers: [...state.onlineUsers, user],
    })),

  removeUser: (userId: string) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.id !== userId),
    })),

  setConnected: (connected: boolean) =>
    set(() => ({
      isConnected: connected,
    })),

  setLoading: (loading: boolean) =>
    set(() => ({
      isLoading: loading,
    })),

  setError: (error: string | null) =>
    set(() => ({
      error,
    })),

  setSearchResults: (results: Message[]) =>
    set(() => ({
      searchResults: results,
    })),

  setSearchQuery: (query: string) =>
    set(() => ({
      searchQuery: query,
    })),

  setShowSearchResults: (show: boolean) =>
    set(() => ({
      showSearchResults: show,
    })),

  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
}));