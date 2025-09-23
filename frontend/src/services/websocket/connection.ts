import { type WebSocketConfig } from './types';
import { useAuthStore } from '@/stores/authStore';

export class WebSocketConnection {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private isAuthenticated = false;
  private config: Required<WebSocketConfig>;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 1000,
      connectionTimeout: config.connectionTimeout ?? 10000
    };
  }

  private getWebSocketURL(): string {
    // Utiliser VITE_WS_URL si défini, sinon construire l'URL
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (wsUrl) {
      console.log('WebSocket: Using configured URL:', wsUrl);
      return wsUrl;
    }
    
    // Fallback vers l'ancien système
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.host;
    const url = `${protocol}//${host}/ws`;
    console.log('WebSocket: Using fallback URL:', url);
    return url;
  }

  async connect(
    onOpen?: () => void,
    onMessage?: (event: MessageEvent) => void,
    onClose?: (event: CloseEvent) => void,
    onError?: (error: Event) => void
  ): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    const { user } = useAuthStore.getState();
    const { default: secureStorage } = await import('../secureStorage');
    const token = secureStorage.getAccessToken();

    if (!user?.id || !token) {
      console.warn('WebSocket: Cannot connect without authentication');
      return;
    }

    this.isConnecting = true;
    this.isAuthenticated = true;

    try {
      const url = this.getWebSocketURL();
      console.log('WebSocket: Connecting...');
      this.ws = new WebSocket(url);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.config.connectionTimeout);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          console.log('WebSocket: Connected successfully');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          onOpen?.();
          resolve();
        };

        this.ws!.onmessage = onMessage || (() => {});
        this.ws!.onclose = (event) => {
          this.isConnecting = false;
          onClose?.(event);
          
          // Gestion automatique de la reconnexion
          if (this.shouldReconnect(event)) {
            this.handleReconnect(onOpen, onMessage, onClose, onError);
          }
        };
        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          onError?.(error);
          reject(error);
        };
      });

    } catch (error) {
      this.isConnecting = false;
      console.error('WebSocket: Connection failed', error);
      
      // Ne pas relancer automatiquement depuis connect(), laisser le onclose s'en charger
      throw error;
    }
  }

  private async handleReconnect(
    onOpen?: () => void,
    onMessage?: (event: MessageEvent) => void,
    onClose?: (event: CloseEvent) => void,
    onError?: (error: Event) => void
  ): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect(onOpen, onMessage, onClose, onError);
      } catch (error) {
        console.error('WebSocket: Reconnection failed', error);
      }
    }, delay);
  }

  send(data: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket: Cannot send message, connection not ready');
      return false;
    }

    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error('WebSocket: Failed to send message', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number | null {
    return this.ws?.readyState ?? null;
  }

  shouldReconnect(event: CloseEvent): boolean {
    return this.isAuthenticated && event.code !== 1000;
  }

  disconnect(): void {
    this.isAuthenticated = false;
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    
    console.log('WebSocket: Disconnected');
  }
}