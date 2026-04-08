import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Active states
  activeChannelId: string | null;
  activeConversationId: string | null;

  // Thread panel
  threadMessageId: string | null;

  // Modals
  modals: {
    createChannel: boolean;
    userSettings: boolean;
    inviteMembers: boolean;
    filePreview: boolean;
  };

  // Mobile
  isMobile: boolean;
  mobileSidebarOpen: boolean;
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Active states
  setActiveChannel: (id: string | null) => void;
  setActiveConversation: (id: string | null) => void;

  // Thread panel
  openThread: (messageId: string) => void;
  closeThread: () => void;

  // Modals
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;

  // Mobile
  setIsMobile: (isMobile: boolean) => void;
  toggleMobileSidebar: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeChannelId: null,
  activeConversationId: null,
  threadMessageId: null,
  modals: {
    createChannel: false,
    userSettings: false,
    inviteMembers: false,
    filePreview: false,
  },
  isMobile: false,
  mobileSidebarOpen: false,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setActiveChannel: (id) => set({ activeChannelId: id, activeConversationId: null }),
  setActiveConversation: (id) => set({ activeConversationId: id, activeChannelId: null }),

  openThread: (messageId) => set({ threadMessageId: messageId }),
  closeThread: () => set({ threadMessageId: null }),

  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),
  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),

  setIsMobile: (isMobile) => set({ isMobile }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
}));
