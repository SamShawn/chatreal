// 用户相关类型
export interface User {
  id: string;
  username: string;
  avatar: string;
  color?: string;
  status?: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
}

// 消息类型
export interface Message {
  id: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string;
  sender: User;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

// 搜索结果类型
export interface SearchResult {
  messages: Message[];
  total: number;
}

// Socket 事件类型
export interface SocketEvents {
  // 连接事件
  'socket:connected': () => void;
  'socket:disconnected': () => void;
  'socket:error': (error: Error) => void;

  // 用户事件
  'user:join': (user: User) => void;
  'user:join:success': (data: { user: User; users: User[] }) => void;
  'user:joined': (user: User) => void;
  'user:left': (user: User) => void;

  // 消息事件
  'message:new': (message: Message) => void;
  'message:search': (results: SearchResult) => void;
  'message:history': (messages: Message[]) => void;

  // 房间事件
  'room:join': (roomId: string) => void;
  'room:join:success': (data: { messages: Message[]; users: User[] }) => void;
}

// 组件 Props 类型
export interface LoginProps {
  onLogin: (username: string) => Promise<User>;
}

export interface ChatProps {
  user: User;
  onLogout: () => void;
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: (file: File) => void;
}

export interface OnlineUsersProps {
  users: User[];
  currentUserId: string;
}

// 状态管理类型
export interface ChatState {
  messages: Message[];
  onlineUsers: User[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: Message[];
  showSearchResults: boolean;
}

export interface ChatActions {
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setOnlineUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchResults: (results: Message[]) => void;
  setSearchQuery: (query: string) => void;
  setShowSearchResults: (show: boolean) => void;
  clearMessages: () => void;
}

export type ChatStore = ChatState & ChatActions;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  logout: () => void;
}

export type AuthStore = AuthState & AuthActions;