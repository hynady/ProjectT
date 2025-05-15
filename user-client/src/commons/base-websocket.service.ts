import { EventEmitter } from '@/commons/lib/utils/event-emitter';

// Connection status constants
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
  ERROR = 'error'
}

// Base WebSocket message interface
export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export interface WebSocketConfig {
  resourceId: string;
  endpoint: string;
  maxReconnectAttempts?: number;
  useMock?: boolean;
  wsUrl?: string;
}

export abstract class BaseWebSocketService {
  protected socket: WebSocket | null = null;
  protected events = new EventEmitter();
  protected status: WebSocketStatus = WebSocketStatus.CLOSED;
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts: number;
  protected reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  protected resourceId: string | null = null;
  protected endpoint: string;
  protected isMockEnabled: boolean;
  protected wsBaseUrl: string | null = null;

  constructor() {
    this.isMockEnabled = import.meta.env.VITE_ENABLE_MOCK === 'true';
    this.maxReconnectAttempts = 5;
    this.endpoint = '';
    // Set default WebSocket base URL from environment variable if available
    this.wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || null;
  }

  /**
   * Create connection to WebSocket server
   */
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
    const wsUrl = this.buildWebSocketUrl();
    
    try {
      this.setStatus(WebSocketStatus.CONNECTING);
      
      if (this.isMockEnabled) {
        this.simulateConnection();
      } else {
        this.socket = new WebSocket(wsUrl);
        
        // Set up event handlers
        this.socket.onopen = this.handleOpen.bind(this);
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onerror = this.handleError.bind(this);
      }
    } catch {
      this.setStatus(WebSocketStatus.ERROR);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.setStatus(WebSocketStatus.CLOSED);
    this.events.emit('close');
    this.clearReconnectTimeout();
  }

  /**
   * Send message to WebSocket server
   */
  public send(message: WebSocketMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      const messageString = JSON.stringify(message);
      this.socket.send(messageString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create WebSocket URL based on configuration
   */
  protected buildWebSocketUrl(): string {
    if (!this.resourceId || !this.endpoint) {
      throw new Error('Cannot build WebSocket URL: resourceId and endpoint must be provided');
    }
    
    if (this.wsBaseUrl) {
      // Remove trailing slash if exists
      const baseUrl = this.wsBaseUrl.endsWith('/') ? this.wsBaseUrl.slice(0, -1) : this.wsBaseUrl;
      // Add leading slash to endpoint if missing
      const formattedEndpoint = this.endpoint.startsWith('/') ? this.endpoint : `/${this.endpoint}`;
      return `${baseUrl}${formattedEndpoint}/${this.resourceId}`;
    } else {
      // Fallback to deriving from window location
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const formattedEndpoint = this.endpoint.startsWith('/') ? this.endpoint : `/${this.endpoint}`;
      return `${protocol}://${window.location.host}${formattedEndpoint}/${this.resourceId}`;
    }
  }

  protected handleOpen(): void {
    this.setStatus(WebSocketStatus.OPEN);
    this.reconnectAttempts = 0;
    this.events.emit('open');
  }

  protected handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.events.emit('message', data);
    } catch {
      // Silent error - unable to parse message
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
      return;
    }
    
    this.clearReconnectTimeout();
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      
      if (this.resourceId) {
        this.connect({
          resourceId: this.resourceId,
          endpoint: this.endpoint,
          useMock: this.isMockEnabled,
          wsUrl: this.wsBaseUrl || undefined
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
    if (this.status !== status) {
      this.status = status;
      this.events.emit('status_change', status);
    }
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Mock implementation - should be overridden by derived classes for specific mock behavior
   */
  protected simulateConnection(): void {
    setTimeout(() => {
      this.setStatus(WebSocketStatus.OPEN);
      this.events.emit('open');
    }, 800);
  }

  /**
   * Register event listener
   */
  public on(event: string, listener: (...args: unknown[]) => void): void {
    this.events.on(event, listener);
  }

  /**
   * Remove event listener
   */
  public off(event: string, listener: (...args: unknown[]) => void): void {
    this.events.off(event, listener);
  }

  /**
   * Register one-time event listener
   */
  public once(event: string, listener: (...args: unknown[]) => void): void {
    this.events.once(event, listener);
  }
}
