// Franchise WebSocket Service
// Real-time events for order_created, payment_success, lead_generated, seo_rank_update

export type WebSocketEventType = 
  | 'order_created'
  | 'payment_success'
  | 'lead_generated'
  | 'seo_rank_update'
  | 'employee_added'
  | 'invoice_created'
  | 'notification';

export interface WebSocketEvent {
  eventType: WebSocketEventType;
  franchiseId: string;
  data: any;
  timestamp: Date;
}

type EventCallback = (event: WebSocketEvent) => void;

class FranchiseWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers: Map<WebSocketEventType, Set<EventCallback>> = new Map();
  private isConnected = false;
  private franchiseId: string | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(franchiseId: string): void {
    this.franchiseId = franchiseId;

    try {
      // WebSocket URL - replace with actual WebSocket server URL
      const wsUrl = `ws://localhost:8080/ws/franchise/${franchiseId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`[WebSocket] Connected for franchise: ${franchiseId}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        this.isConnected = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.franchiseId) {
        this.connect(this.franchiseId);
      }
    }, delay);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: any): void {
    const event: WebSocketEvent = {
      eventType: data.eventType,
      franchiseId: data.franchiseId,
      data: data.data,
      timestamp: new Date(data.timestamp),
    };

    console.log(`[WebSocket] Received event: ${event.eventType}`, event);

    // Notify subscribers
    const callbacks = this.subscribers.get(event.eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }

    // Sync to Boss Panel
    this.syncToBossPanel(event);
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: WebSocketEventType, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Unsubscribe from specific event type
   */
  unsubscribe(eventType: WebSocketEventType, callback: EventCallback): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Unsubscribe all callbacks for event type
   */
  unsubscribeAll(eventType: WebSocketEventType): void {
    this.subscribers.delete(eventType);
  }

  /**
   * Send event to server
   */
  send(eventType: WebSocketEventType, data: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('[WebSocket] Not connected, cannot send event');
      return;
    }

    const message = {
      eventType,
      franchiseId: this.franchiseId,
      data,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Sync event to Boss Panel
   */
  private syncToBossPanel(event: WebSocketEvent): void {
    console.log(`[WebSocket] Syncing to Boss Panel: ${event.eventType}`, event);
    // This will integrate with the event bus for real-time sync to Boss Panel
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const franchiseWebSocketService = new FranchiseWebSocketService();

// React hook for WebSocket
export function useFranchiseWebSocket(franchiseId: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    franchiseWebSocketService.connect(franchiseId);
    setIsConnected(franchiseWebSocketService.getConnectionStatus());

    const handleConnectionChange = () => {
      setIsConnected(franchiseWebSocketService.getConnectionStatus());
    };

    // Subscribe to connection status changes (if implemented)
    const unsubscribe = franchiseWebSocketService.subscribe('notification', () => {
      handleConnectionChange();
    });

    return () => {
      unsubscribe();
      franchiseWebSocketService.disconnect();
    };
  }, [franchiseId]);

  return {
    isConnected,
    subscribe: franchiseWebSocketService.subscribe.bind(franchiseWebSocketService),
    send: franchiseWebSocketService.send.bind(franchiseWebSocketService),
  };
}

// Import useState and useEffect for the hook
import { useState, useEffect } from 'react';
