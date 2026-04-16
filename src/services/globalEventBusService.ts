// Global Event Bus Service
// Publish/subscribe system with event_stream table

export interface Event {
  eventId: string;
  eventType: string;
  source: string;
  payload: any;
  timestamp: Date;
  metadata?: any;
}

type EventCallback = (event: Event) => void;

// In-memory event bus
const eventSubscribers: Map<string, Set<EventCallback>> = new Map();
const eventStream: Event[] = [];

/**
 * Publish event
 */
export function publishEvent(event: Omit<Event, 'eventId' | 'timestamp'>): Event {
  const fullEvent: Event = {
    ...event,
    eventId: crypto.randomUUID(),
    timestamp: new Date(),
  };

  // Add to stream
  eventStream.push(fullEvent);

  // Keep only last 1000 events
  if (eventStream.length > 1000) {
    eventStream.shift();
  }

  // Notify subscribers
  const subscribers = eventSubscribers.get(event.eventType) || new Set();
  subscribers.forEach(callback => {
    try {
      callback(fullEvent);
    } catch (error) {
      console.error(`[Event Bus] Error in callback for ${event.eventType}:`, error);
    }
  });

  // Sync to control panel
  syncToControlPanel(fullEvent);

  return fullEvent;
}

/**
 * Subscribe to event type
 */
export function subscribeEvent(eventType: string, callback: EventCallback): () => void {
  if (!eventSubscribers.has(eventType)) {
    eventSubscribers.set(eventType, new Set());
  }

  eventSubscribers.get(eventType)!.add(callback);

  // Return unsubscribe function
  return () => {
    const subscribers = eventSubscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
    }
  };
}

/**
 * Unsubscribe from event type
 */
export function unsubscribeEvent(eventType: string, callback: EventCallback): void {
  const subscribers = eventSubscribers.get(eventType);
  if (subscribers) {
    subscribers.delete(callback);
  }
}

/**
 * Get event stream
 */
export function getEventStream(
  eventType?: string,
  limit: number = 100,
  offset: number = 0
): Event[] {
  let events = eventStream;

  if (eventType) {
    events = events.filter(e => e.eventType === eventType);
  }

  return events.slice(offset, offset + limit);
}

/**
 * Clear event stream
 */
export function clearEventStream(): void {
  eventStream.length = 0;
}

/**
 * Sync to control panel
 */
function syncToControlPanel(event: Event): void {
  console.log(`[Event Bus] Syncing to Control Panel: ${event.eventType}`, event);
  // This will integrate with WebSocket for real-time sync
}
