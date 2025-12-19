// Ultra-Fast Realtime Engine - WebSocket + Fallback
type MessageHandler = (data: unknown) => void;
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface QueuedMessage {
  channel: string;
  event: string;
  data: unknown;
  timestamp: number;
}

export class RealtimeEngine {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private messageQueue: QueuedMessage[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private url: string;
  private stateListeners = new Set<(state: ConnectionState) => void>();

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.setState('connecting');

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.setState('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        this.ws.onclose = () => {
          this.setState('disconnected');
          this.stopHeartbeat();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private setState(state: ConnectionState) {
    this.state = state;
    this.stateListeners.forEach(listener => listener(state));
  }

  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(message: { channel?: string; event?: string; data?: unknown }) {
    const { channel, event, data } = message;
    const key = `${channel}:${event}`;
    
    const handlers = this.handlers.get(key);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error('Handler error:', e);
        }
      });
    }

    // Broadcast handlers
    const broadcastHandlers = this.handlers.get('*');
    if (broadcastHandlers) {
      broadcastHandlers.forEach(handler => handler(message));
    }
  }

  subscribe(channel: string, event: string, handler: MessageHandler): () => void {
    const key = `${channel}:${event}`;
    
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    
    this.handlers.get(key)!.add(handler);

    // Send subscription message
    this.send('system', 'subscribe', { channel, event });

    return () => {
      this.handlers.get(key)?.delete(handler);
      if (this.handlers.get(key)?.size === 0) {
        this.handlers.delete(key);
        this.send('system', 'unsubscribe', { channel, event });
      }
    };
  }

  send(channel: string, event: string, data: unknown): void {
    const message = { channel, event, data, timestamp: Date.now() };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private flushQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  disconnect() {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
    this.setState('disconnected');
  }

  getState(): ConnectionState {
    return this.state;
  }
}

// Singleton instance
let realtimeInstance: RealtimeEngine | null = null;

export const getRealtimeEngine = (url?: string): RealtimeEngine => {
  if (!realtimeInstance && url) {
    realtimeInstance = new RealtimeEngine(url);
  }
  return realtimeInstance!;
};
