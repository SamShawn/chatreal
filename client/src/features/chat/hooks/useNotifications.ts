import { useEffect, useState } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider';
import { useAuth } from '../../../app/providers/AuthProvider';

interface UseNotificationsOptions {
  enabled?: boolean;
  showToast?: (title: string, body: string) => void;
}

/**
 * Hook to manage desktop notifications for new messages
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): { permission: NotificationPermission; requestPermission: () => Promise<void> } {
  const { enabled = true, showToast } = options;
  const { socket } = useSocket();
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Request notification permission
  const requestPermission = async (): Promise<void> => {
    if (typeof Notification === 'undefined') return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  // Handle incoming messages
  useEffect(() => {
    if (!enabled) return;

    const handleMessageNew = (data: { sender?: { username?: string }; content?: string }): void => {
      // Don't notify for own messages
      if (data.sender?.username === user?.username) return;

      const title = data.sender?.username || 'New message';
      const body = data.content || '';

      // Use browser notifications if available and permitted
      if (permission === 'granted' && !document.hasFocus()) {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'chat-message',
        });

        notification.onclick = (): void => {
          window.focus();
          notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }

      // Also show in-app toast if provided
      if (showToast) {
        showToast(title, body);
      }
    };

    socket.on('message:new', handleMessageNew as (data: unknown) => void);

    return () => {
      socket.off('message:new', handleMessageNew as (data: unknown) => void);
    };
  }, [enabled, permission, user, socket, showToast]);

  return { permission, requestPermission };
}
