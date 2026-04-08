import { createContext, useContext, useEffect, type ReactNode } from 'react';
import socketClient from '../../lib/socket/client';
import { useAuth } from './AuthProvider';

interface SocketContextValue {
  socket: typeof socketClient;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps): JSX.Element {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect when authenticated
      socketClient.connect();
    } else {
      // Disconnect when not authenticated
      socketClient.disconnect();
    }

    return () => {
      socketClient.offAll();
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketClient,
        isConnected: socketClient.isConnected(),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
