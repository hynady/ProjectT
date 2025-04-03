import { EventEmitter } from '@/commons/lib/utils/event-emitter';

// Connection status constants
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
  ERROR = 'error'
}

export interface WebSocketConfig {
  resourceId: string;
  endpoint: string;
  maxReconnectAttempts?: number;
  useMock?: boolean;
  wsUrl?: string;  // Added new optional parameter for explicit WebSocket URL
}

export abstract class BaseWebSocketService {
  protected socket: WebSocket | null = null;
  protected events = new EventEmitter();
  protected status: WebSocketStatus = WebSocketStatus.CLOSED;
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts: number;
  protected reconnectTimeout: any = null;
  protected resourceId: string | null = null;
  protected endpoint: string;
  protected isMockEnabled: boolean;
  protected wsBaseUrl: string | null = null;
  protected processedMessageIds: Set<string> | null = null;

  constructor() {
    this.isMockEnabled = import.meta.env.VITE_ENABLE_MOCK === 'true';
    this.maxReconnectAttempts = 5;
    this.endpoint = '';
    // Set default WebSocket base URL from environment variable if available
    this.wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || null;
  }

  public connect(config: WebSocketConfig): void {
    this.resourceId = config.resourceId;
    this.endpoint = config.endpoint;
    this.maxReconnectAttempts = config.maxReconnectAttempts || this.maxReconnectAttempts;
    
    if (config.useMock !== undefined) {
      this.isMockEnabled = config.useMock;
    }

    // If a specific WebSocket URL is provided in the config, use it
    if (config.wsUrl) {
      this.wsBaseUrl = config.wsUrl;
    }
    
    // Create WebSocket URL
    let wsUrl;
    if (this.wsBaseUrl) {
      // Use provided base URL
      wsUrl = `${this.wsBaseUrl}${this.endpoint}/${this.resourceId}`;
    } else {
      // Fallback to deriving from window location
      wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${this.endpoint}/${this.resourceId}`;
    }
    
    console.log(`WebSocket connecting to: ${wsUrl}`);
    
    try {
      this.setStatus(WebSocketStatus.CONNECTING);
      
      if (this.isMockEnabled) {
        // Simulate connection in mock mode
        console.log(`WebSocket using MOCK mode for ${this.resourceId}`);
        this.simulateConnection();
      } else {
        // Create real WebSocket connection
        console.log(`WebSocket using REAL mode for ${this.resourceId}`);
        this.socket = new WebSocket(wsUrl);
        
        // Set up event handlers
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.setStatus(WebSocketStatus.ERROR);
      this.attemptReconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.setStatus(WebSocketStatus.CLOSED);
    this.events.emit('close');
    this.clearReconnectTimeout();
  }

  protected handleOpen(): void {
    this.setStatus(WebSocketStatus.OPEN);
    this.reconnectAttempts = 0;
    this.events.emit('open');
  }

  protected handleMessage(event: MessageEvent): void {
    try {
      console.log(`[WS-DEBUG] BaseWebSocketService received raw message:`, event.data);
      
      const data = JSON.parse(event.data);
      console.log(`[WS-DEBUG] BaseWebSocketService parsed message:`, data);
      
      // Khởi tạo và in ra thông tin stack trace để xác định nơi gọi
      const stackTrace = new Error().stack;
      console.log(`[WS-DEBUG] Message handling stack trace:`, stackTrace);
      
      // In ra thời gian chính xác khi nhận được tin nhắn
      console.log(`[WS-DEBUG] Message received at exact time:`, new Date().toISOString(), Date.now());
      
      this.events.emit('message', data);
    } catch (error) {
      console.error('[WS-DEBUG] Failed to parse WebSocket message:', error);
    }
  }

  protected handleClose(event: CloseEvent): void {
    this.setStatus(WebSocketStatus.CLOSED);
    this.events.emit('close', event);
    
    if (!event.wasClean) {
      this.attemptReconnect();
    }
  }

  protected handleError(event: Event): void {
    this.setStatus(WebSocketStatus.ERROR);
    this.events.emit('error', event);
    this.attemptReconnect();
  }

  protected attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.clearReconnectTimeout();
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.resourceId) {
        this.connect({
          resourceId: this.resourceId,
          endpoint: this.endpoint
        });
      }
    }, delay);
  }

  protected clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  protected setStatus(status: WebSocketStatus): void {
    this.status = status;
    this.events.emit('status_change', status);
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  // Mock implementation - should be overridden by derived classes for specific mock behavior
  protected simulateConnection(): void {
    setTimeout(() => {
      this.setStatus(WebSocketStatus.OPEN);
      this.events.emit('open');
    }, 800);
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.events.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.events.off(event, listener);
  }

  public once(event: string, listener: (...args: any[]) => void): void {
    this.events.once(event, listener);
  }
}
