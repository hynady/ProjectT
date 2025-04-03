// Simple EventEmitter implementation for the browser
export class EventEmitter {
  private events: Record<string, Array<(...args: unknown[]) => void>> = {};
  // Cache để theo dõi tin nhắn đã phát ra gần đây nhất
  private lastEmittedStatuses: Map<string, { data: unknown, timestamp: number }> = new Map();
  // Thời gian (milliseconds) để xem tin nhắn là trùng lặp
  private readonly DUPLICATE_THRESHOLD_MS = 3000;

  constructor() {
    // Khởi tạo EmitEvent
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.events[event]) {
      return;
    }
    
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  once(event: string, listener: (...args: unknown[]) => void): void {
    const onceWrapper = (...args: unknown[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    
    this.on(event, onceWrapper);
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.events[event]) {
      return;
    }

    // Check for duplicate messages only for 'message' events
    if (event === 'message' && args.length > 0 && this.isDuplicateMessage(args[0])) {
      return;
    }
    
    // Dispatch event to all listeners
    this.events[event].forEach(listener => listener(...args));
  }

  // Helper method to check for duplicate messages
  private isDuplicateMessage(message: unknown): boolean {
    if (!message || typeof message !== 'object' || message === null) {
      return false;
    }
    
    // Type guard for message
    const typedMessage = message as Record<string, unknown>;
    
    if (!typedMessage.type || !typedMessage.status) {
      return false;
    }

    const statusKey = `${String(typedMessage.type)}_${String(typedMessage.status)}`;
    const now = Date.now();
    const lastEmitted = this.lastEmittedStatuses.get(statusKey);
    
    if (lastEmitted && (now - lastEmitted.timestamp) < this.DUPLICATE_THRESHOLD_MS) {
      return true;
    }
    
    // Update cache with this message
    this.lastEmittedStatuses.set(statusKey, { data: message, timestamp: now });
    
    // Clean up old entries if needed
    if (this.lastEmittedStatuses.size > 10) {
      const oldestKey = Array.from(this.lastEmittedStatuses.keys())[0];
      this.lastEmittedStatuses.delete(oldestKey);
    }
    
    return false;
  }
}