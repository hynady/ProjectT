import { BaseWebSocketService, WebSocketMessage, WebSocketStatus, WebSocketConfig } from '@/commons/base-websocket.service';

// Interface định nghĩa cấu trúc của tin nhắn thanh toán
export interface PaymentMessage extends WebSocketMessage {
  type: string;
  status: string;
  timestamp: string;
  [key: string]: unknown;
}

// Các trạng thái thanh toán có thể có
export enum PaymentStatus {
  WAITING_PAYMENT = 'waiting_payment',
  PAYMENT_RECEIVED = 'payment_received',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export class PaymentWebSocketService extends BaseWebSocketService {
  private static instance: PaymentWebSocketService;
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

  // Phương thức kết nối riêng cho Payment, giữ cùng signature với lớp cha
  public override connect(config: WebSocketConfig): void {
    // Tránh kết nối nhiều lần
    if (this.isConnecting || this.getStatus() === WebSocketStatus.CONNECTING) {
      return;
    }

    this.isConnecting = true;
    
    // Override handlers để cập nhật trạng thái isConnecting
    const originalHandleOpen = this.handleOpen.bind(this);
    this.handleOpen = () => {
      this.isConnecting = false;
      originalHandleOpen();
    };
    
    const originalHandleClose = this.handleClose.bind(this);
    this.handleClose = (event: CloseEvent) => {
      this.isConnecting = false;
      originalHandleClose(event);
    };
    
    const originalHandleError = this.handleError.bind(this);
    this.handleError = (event: Event) => {
      this.isConnecting = false;
      originalHandleError(event);
    };
    
    // Gọi phương thức connect của lớp cha
    super.connect(config);
  }
  // Helper method để dễ dàng kết nối với payment ID
  public connectToPayment(paymentId: string, customConfig?: Partial<WebSocketConfig>): void {
    // Chuẩn bị cấu hình mặc định
    const defaultConfig: WebSocketConfig = {
      resourceId: paymentId,
      endpoint: '/payment-ws',  // Match the new endpoint in the backend
      useMock: this.isMockEnabled
    };
    
    // Áp dụng cấu hình tùy chỉnh nếu có
    const config = { ...defaultConfig, ...(customConfig || {}) };
    
    // Gọi phương thức connect đã override
    this.connect(config);
  }

  // Gửi thông báo cập nhật thanh toán
  public sendPaymentUpdate(status: PaymentStatus, additionalData: Record<string, unknown> = {}): boolean {
    const message: PaymentMessage = {
      type: 'payment_update',
      status: status,
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    return this.send(message);
  }

  // Lấy trạng thái thanh toán hiện tại (nếu server hỗ trợ)
  public requestPaymentStatus(): boolean {
    const message: WebSocketMessage = {
      type: 'get_payment_status',
      timestamp: new Date().toISOString()
    };
    
    return this.send(message);
  }

  // Phương thức tiện ích để đăng ký nhận cập nhật trạng thái thanh toán
  public onPaymentStatusChange(callback: (status: PaymentStatus, data: PaymentMessage) => void): void {
    this.on('message', (data: unknown) => {
      // Type guard để kiểm tra cấu trúc đúng của PaymentMessage
      if (this.isPaymentStatusMessage(data)) {
        callback(data.status as PaymentStatus, data);
      }
    });
  }

  // Type guard để kiểm tra tin nhắn có phải là PaymentMessage không
  private isPaymentStatusMessage(data: unknown): data is PaymentMessage {
    if (typeof data !== 'object' || data === null) return false;
    
    const message = data as Partial<PaymentMessage>;
    return message.type === 'payment_status' && typeof message.status === 'string';
  }

  // Override phương thức mô phỏng cho chế độ mock
  protected override simulateConnection(): void {
    // Mô phỏng thiết lập kết nối
    setTimeout(() => {
      this.setStatus(WebSocketStatus.OPEN);
      this.events.emit('open');
      
      // Mô phỏng trạng thái thanh toán ban đầu
      setTimeout(() => {
        const initialStatusMessage: PaymentMessage = {
          type: 'payment_status',
          status: PaymentStatus.WAITING_PAYMENT,
          timestamp: new Date().toISOString()
        };
        
        this.events.emit('message', initialStatusMessage);
        
        // Mô phỏng các cập nhật trạng thái thanh toán
        this.simulatePaymentUpdates();
      }, 1000);
    }, 800);
  }

  // Mô phỏng các cập nhật trạng thái thanh toán theo thời gian
  private simulatePaymentUpdates(): void {
    const statuses = [
      { status: PaymentStatus.PAYMENT_RECEIVED, delay: 10000 },
      { status: PaymentStatus.PROCESSING, delay: 5000 },
      { status: PaymentStatus.COMPLETED, delay: 3000 }
    ];
    
    let cumulativeDelay = 0;
    
    statuses.forEach(statusInfo => {
      cumulativeDelay += statusInfo.delay;
      
      setTimeout(() => {
        if (this.getStatus() === WebSocketStatus.OPEN) {
          const statusMessage: PaymentMessage = {
            type: 'payment_status',
            status: statusInfo.status,
            timestamp: new Date().toISOString()
          };
          
          this.events.emit('message', statusMessage);
          
          // Đóng kết nối khi hoàn thành
          if (statusInfo.status === PaymentStatus.COMPLETED) {
            setTimeout(() => this.disconnect(), 1000);
          }
        }
      }, cumulativeDelay);
    });
  }
}

// Xuất singleton instance để sử dụng trong ứng dụng
export const paymentWebSocketService = PaymentWebSocketService.getInstance();