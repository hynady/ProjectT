// Simple EventEmitter implementation for the browser
export class EventEmitter {
  private events: Record<string, Array<(...args: any[]) => void>> = {};
  // Cache để theo dõi tin nhắn đã phát ra gần đây nhất
  private lastEmittedStatuses: Map<string, { data: any, timestamp: number }> = new Map();
  // Thời gian (milliseconds) để xem tin nhắn là trùng lặp
  private readonly DUPLICATE_THRESHOLD_MS = 3000; // Tăng lên 3 giây để có đủ thời gian lọc
  private readonly DEBUG_ID = `EventEmitter_${Math.random().toString(36).substring(2, 8)}`;

  constructor() {
    console.log(`[WS-DEBUG] ${this.DEBUG_ID} EventEmitter instance created`);
  }

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    // Ghi log khi có listener mới được đăng ký
    const listenerCount = this.events[event].length;
    console.log(`[WS-DEBUG] ${this.DEBUG_ID} Event '${event}' listener #${listenerCount + 1} registered. Total listeners: ${listenerCount + 1}`);
    
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) {
      return;
    }
    
    const prevCount = this.events[event].length;
    this.events[event] = this.events[event].filter(l => l !== listener);
    const newCount = this.events[event].length;
    
    // Ghi log khi listener bị hủy đăng ký
    console.log(`[WS-DEBUG] ${this.DEBUG_ID} Event '${event}' listener removed. Previous: ${prevCount}, Current: ${newCount}`);
  }

  once(event: string, listener: (...args: any[]) => void): void {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    
    console.log(`[WS-DEBUG] ${this.DEBUG_ID} Event '${event}' one-time listener registered`);
    this.on(event, onceWrapper);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) {
      return;
    }

    // Ghi log khi một sự kiện được phát ra
    console.log(`[WS-DEBUG] ${this.DEBUG_ID} Emitting event '${event}' to ${this.events[event].length} listeners`);

    // Đối với sự kiện 'message', kiểm tra và lọc tin nhắn trùng lặp
    if (event === 'message' && args.length > 0) {
      const message = args[0];
      
      // Tạo khóa từ tin nhắn - CHỈ DÙNG type và status, KHÔNG dùng timestamp
      let statusKey = '';
      if (message && typeof message === 'object') {
        if (message.type && message.status) {
          statusKey = `${message.type}_${message.status}`;
          console.log(`[WS-DEBUG] ${this.DEBUG_ID} Message status key (without timestamp): ${statusKey}`);
        } else {
          console.log(`[WS-DEBUG] ${this.DEBUG_ID} Cannot create message key due to missing properties:`, message);
        }
      }
      
      if (statusKey) {
        const now = Date.now();
        const lastEmitted = this.lastEmittedStatuses.get(statusKey);
        
        // Kiểm tra xem trạng thái này đã được phát gần đây chưa
        if (lastEmitted) {
          const timeSinceLastEmit = now - lastEmitted.timestamp;
          console.log(`[WS-DEBUG] ${this.DEBUG_ID} Time since last emit for status ${statusKey}: ${timeSinceLastEmit}ms`);
          
          if (timeSinceLastEmit < this.DUPLICATE_THRESHOLD_MS) {
            console.log(`[WS-DEBUG] ${this.DEBUG_ID} Skipping duplicate status message received within ${this.DUPLICATE_THRESHOLD_MS}ms:`, message);
            return;
          }
        }
        
        // Lưu lại trạng thái này vào cache
        this.lastEmittedStatuses.set(statusKey, { data: message, timestamp: now });
        console.log(`[WS-DEBUG] ${this.DEBUG_ID} Saved status with key ${statusKey} to cache. Cache size: ${this.lastEmittedStatuses.size}`);
        
        // Xóa các trạng thái cũ để tránh tràn bộ nhớ
        if (this.lastEmittedStatuses.size > 10) {
          const oldestKey = Array.from(this.lastEmittedStatuses.keys())[0];
          this.lastEmittedStatuses.delete(oldestKey);
          console.log(`[WS-DEBUG] ${this.DEBUG_ID} Removed oldest status with key ${oldestKey} from cache`);
        }
      }
    }
    
    // Phát sự kiện cho tất cả listeners
    this.events[event].forEach((listener, index) => {
      console.log(`[WS-DEBUG] ${this.DEBUG_ID} Calling listener #${index + 1} for event '${event}'`);
      listener(...args);
    });
  }
}