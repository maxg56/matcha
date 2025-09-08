import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';

interface WebSocketContextValue {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuthStore();
  const { initializeWebSocket } = useChatStore();
  const webSocket = useWebSocketConnection();

  // Initialiser les handlers WebSocket quand l'utilisateur est connecté
  useEffect(() => {
    if (user?.id) {
      console.log('Initializing WebSocket connections for user:', user.id);
      
      // Initialiser le WebSocket pour le chat
      initializeWebSocket();
      
      // Autres initialisations peuvent être ajoutées ici
      // Par exemple : matchStore.initializeWebSocket(), etc.
    }
  }, [user?.id, initializeWebSocket]);

  const contextValue: WebSocketContextValue = {
    isConnected: webSocket.isConnected(),
    connect: () => webSocket.connect(),
    disconnect: () => webSocket.disconnect(),
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// Hook pour afficher l'état de connexion WebSocket (utile pour le debug)
export function useWebSocketStatus() {
  const context = useContext(WebSocketContext);
  return {
    isConnected: context?.isConnected ?? false,
    hasProvider: !!context,
  };
}