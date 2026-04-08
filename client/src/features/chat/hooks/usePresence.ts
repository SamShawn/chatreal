import { useEffect } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider';
import { useChatStore } from '../../../store/chatStore';
import type { User } from '../../../types';

interface PresenceChangedData {
  userId: string;
  status: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
  users: Array<{
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    status: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
    role: string;
  }>;
}

/**
 * Hook to manage presence state (online/away/dnd/offline)
 */
export function usePresence(): void {
  const { socket } = useSocket();
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);

  useEffect(() => {
    const handlePresenceChanged = (data: unknown): void => {
      const typedData = data as PresenceChangedData;
      const users: User[] = typedData.users.map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar || '',
        status: u.status,
      }));
      setOnlineUsers(users);
    };

    socket.on('presence:changed', handlePresenceChanged);

    return () => {
      socket.off('presence:changed', handlePresenceChanged);
    };
  }, [socket, setOnlineUsers]);
}
