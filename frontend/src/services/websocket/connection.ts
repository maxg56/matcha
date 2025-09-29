import { type WebSocketConfig } from './types';
import { useAuthStore } from '@/stores/authStore';

export class WebSocketConnection {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private isAuthenticated = false;
  private config: Required<WebSocketConfig>;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongReceived = Date.now();
  private connectionHealth = { healthy: true, lastCheck: Date.now() };
  private connectionAttemptTimestamp = 0;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 1000,
      connectionTimeout: config.connectionTimeout ?? 10000
    };
  }

  private getWebSocketURL(): string {
    const token = localStorage.getItem('accessToken');

    // Utiliser VITE_WS_URL si défini, sinon construire l'URL
    const wsUrl = import.meta.env.VITE_WS_URL;
    let baseUrl: string;

    if (wsUrl) {
      console.log('WebSocket: Using configured URL:', wsUrl);
      baseUrl = wsUrl;
    } else {
      // Fallback vers l'ancien système
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.VITE_WS_HOST || window.location.host;
      baseUrl = `${protocol}//${host}/ws`;
      console.log('WebSocket: Using fallback URL:', baseUrl);
    }

    // Ajouter le token comme paramètre de requête si disponible
    if (token) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      const finalUrl = `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
      console.log('WebSocket: URL with token parameter');
      return finalUrl;
    }

    return baseUrl;
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
    const token = localStorage.getItem('accessToken');

    if (!user?.id || !token) {
      console.warn('WebSocket: Cannot connect without authentication');
      return;
    }

    this.isConnecting = true;
    this.isAuthenticated = true;
    this.connectionAttemptTimestamp = Date.now();

    try {
      const url = this.getWebSocketURL();
      console.log('WebSocket: Connecting...', { url, attempt: this.reconnectAttempts + 1 });
      this.ws = new WebSocket(url);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.config.connectionTimeout);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          const connectionTime = Date.now() - this.connectionAttemptTimestamp;
          console.log('WebSocket: Connected successfully', {
            connectionTime: `${connectionTime}ms`,
            attempt: this.reconnectAttempts + 1
          });
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.lastPongReceived = Date.now();
          this.connectionHealth = { healthy: true, lastCheck: Date.now() };
          this.startPingInterval();
          onOpen?.();
          resolve();
        };

        this.ws!.onmessage = onMessage || (() => {});
        this.ws!.onclose = (event) => {
          this.isConnecting = false;
          this.stopPingInterval();
          this.connectionHealth = { healthy: false, lastCheck: Date.now() };

          console.log('WebSocket: Connection closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            reconnectAttempts: this.reconnectAttempts
          });

          onClose?.(event);

          // Gestion automatique de la reconnexion
          if (this.shouldReconnect(event)) {
            this.handleReconnect(onOpen, onMessage, onClose, onError);
          }
        };
        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.connectionHealth = { healthy: false, lastCheck: Date.now() };

          console.error('WebSocket: Connection error', {
            error,
            readyState: this.ws?.readyState,
            reconnectAttempts: this.reconnectAttempts
          });

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

  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Check if we've received a pong recently
        const timeSinceLastPong = Date.now() - this.lastPongReceived;
        if (timeSinceLastPong > 90000) { // 90 seconds without pong = connection issue
          console.warn('WebSocket: No pong received for 90 seconds, assuming connection is dead');
          this.ws.close(1006, 'No pong received');
          return;
        }

        try {
          console.log('WebSocket: Sending ping');
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('WebSocket: Failed to send ping', error);
          this.ws.close();
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handlePong(): void {
    this.lastPongReceived = Date.now();
    console.log('WebSocket: Pong received');
  }

  // Method to be called by message handler when pong is received
  onPong(): void {
    this.handlePong();
  }

  getConnectionHealth(): { healthy: boolean; lastCheck: number; diagnostics: any } {
    const now = Date.now();
    const timeSinceLastPong = now - this.lastPongReceived;
    const readyState = this.ws?.readyState;

    return {
      healthy: this.connectionHealth.healthy && readyState === WebSocket.OPEN,
      lastCheck: now,
      diagnostics: {
        readyState,
        readyStateText: this.getReadyStateText(readyState),
        timeSinceLastPong,
        isAuthenticated: this.isAuthenticated,
        isConnecting: this.isConnecting,
        reconnectAttempts: this.reconnectAttempts
      }
    };
  }

  private getReadyStateText(readyState?: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  disconnect(): void {
    this.isAuthenticated = false;
    this.stopPingInterval();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    console.log('WebSocket: Disconnected');
  }
}