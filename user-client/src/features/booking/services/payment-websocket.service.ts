import { BaseWebSocketService, WebSocketStatus } from '@/commons/base-websocket.service';

// Lưu các tin nhắn đã xử lý để tránh xử lý lặp lại
interface ProcessedMessage {
  timestamp: string;
  type: string;
  status: string;
}

export class PaymentWebSocketService extends BaseWebSocketService {
  private static instance: PaymentWebSocketService;
  private processedMessages: Set<string> = new Set(); // Dùng Set để lưu trữ ID của các tin nhắn đã xử lý
  private isConnecting: boolean = false;

  private constructor() {
    super();
  }

  public static getInstance(): PaymentWebSocketService {
    if (!PaymentWebSocketService.instance) {
      PaymentWebSocketService.instance = new PaymentWebSocketService();
    }
    return PaymentWebSocketService.instance;
  }

  // Tính toán messageId dựa trên nội dung tin nhắn để tránh xử lý lặp lại
  private getMessageId(message: ProcessedMessage): string {
    return `${message.type}_${message.status}_${message.timestamp}`;
  }
  
  // Kiểm tra xem tin nhắn đã được xử lý chưa
  public isMessageProcessed(message: ProcessedMessage): boolean {
    const messageId = this.getMessageId(message);
    return this.processedMessages.has(messageId);
  }
  
  // Đánh dấu tin nhắn đã được xử lý
  public markMessageAsProcessed(message: ProcessedMessage): void {
    const messageId = this.getMessageId(message);
    this.processedMessages.add(messageId);
    
    // Xóa tin nhắn cũ sau 60 giây để tránh tràn bộ nhớ
    setTimeout(() => {
      this.processedMessages.delete(messageId);
    }, 60000);
  }

  public connect(paymentId: string): void {
    // Tránh kết nối nhiều lần
    if (this.isConnecting || this.getStatus() === WebSocketStatus.CONNECTING) {
      console.log('WebSocket already connecting, skipping redundant connection request');
      return;
    }

    this.isConnecting = true;
    this.processedMessages.clear(); // Xóa danh sách tin nhắn đã xử lý khi bắt đầu kết nối mới
    
    console.log(`Payment WebSocket connecting with ${this.isMockEnabled ? 'MOCK' : 'REAL'} mode for payment ID: ${paymentId}`);
    
    // Define WebSocket server URL - adjust this to match your actual WebSocket server
    // If you don't have a VITE_WS_BASE_URL set in your environment, uncomment and set the explicit URL below
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080';
    
    // Override onopen handle để cập nhật trạng thái isConnecting
    const originalHandleOpen = this.handleOpen.bind(this);
    this.handleOpen = () => {
      this.isConnecting = false;
      originalHandleOpen();
    };
    
    // Override handleClose để cập nhật trạng thái isConnecting
    const originalHandleClose = this.handleClose.bind(this);
    this.handleClose = (event: CloseEvent) => {
      this.isConnecting = false;
      originalHandleClose(event);
    };
    
    // Override handleError để cập nhật trạng thái isConnecting
    const originalHandleError = this.handleError.bind(this);
    this.handleError = (event: Event) => {
      this.isConnecting = false;
      originalHandleError(event);
    };

    super.connect({
      resourceId: paymentId,
      endpoint: '/api/payment-ws',
      wsUrl: wsBaseUrl
    });
  }

  // Override the simulation method with payment-specific mock behavior
  protected override simulateConnection(): void {
    // Simulate connection establishment
    setTimeout(() => {
      this.setStatus(WebSocketStatus.OPEN);
      this.events.emit('open');
      
      // Simulate initial payment status
      setTimeout(() => {
        this.events.emit('message', {
          type: 'payment_status',
          status: 'waiting_payment',
          timestamp: new Date().toISOString()
        });
        
        // Simulate payment progress updates
        this.simulatePaymentUpdates();
      }, 1000);
    }, 800);
  }

  // Simulate payment status updates over time
  private simulatePaymentUpdates(): void {
    const statuses = [
      { status: 'payment_received', delay: 10000 },
      { status: 'processing', delay: 5000 },
      { status: 'completed', delay: 3000 }
    ];
    
    let cumulativeDelay = 0;
    
    statuses.forEach(statusInfo => {
      cumulativeDelay += statusInfo.delay;
      
      setTimeout(() => {
        if (this.getStatus() === WebSocketStatus.OPEN) {
          this.events.emit('message', {
            type: 'payment_status',
            status: statusInfo.status,
            timestamp: new Date().toISOString()
          });
          
          // Close the connection when complete
          if (statusInfo.status === 'completed') {
            setTimeout(() => this.disconnect(), 1000);
          }
        }
      }, cumulativeDelay);
    });
  }
}

export const paymentWebSocketService = PaymentWebSocketService.getInstance();