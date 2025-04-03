import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/commons/components/card.tsx';
import { Button } from '@/commons/components/button.tsx';
import { PaymentDetails } from '@/features/booking/internal-types/booking.type';
import { AlertCircle, ArrowLeft, Clock, Download, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/commons/components/alert.tsx';
import { ScrollToTop } from '@/commons/blocks/ScrollToTop.tsx';
import { Separator } from '@/commons/components/separator.tsx';
import { usePaymentProcess } from '../hooks/usePaymentProcess';
import { toast } from '@/commons/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { paymentWebSocketService } from '../services/payment-websocket.service';
import { WebSocketStatus } from '@/commons/base-websocket.service';

interface QRPaymentProps {
  occaId: string;
  showId: string;
  tickets: {
    id: string;
    type: string;
    quantity: number;
  }[];
  onBack: () => void;
  onPaymentSuccess: () => void;
}

type PaymentStatus = 'waiting_payment' | 'payment_received' | 'processing' | 'completed' | 'failed';

export const QRPayment = ({
  occaId,
  showId,
  tickets,
  onBack,
  onPaymentSuccess
}: QRPaymentProps) => {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<PaymentDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting_payment');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [websocketStatus, setWebsocketStatus] = useState<WebSocketStatus>(WebSocketStatus.CLOSED);
  
  const { isProcessing, error, startPayment } = usePaymentProcess({
    bookingData: {
      showId,
      tickets
    },
    occaId,
    onSuccess: (details) => {
      setPaymentInfo(details);
      // Không kết nối WebSocket ở đây nữa, để useEffect lo
    },
    onError: (error) => {
      toast({
        title: "Không thể xử lý thanh toán",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Kết nối WebSocket khi paymentInfo có sẵn - chỉ kết nối một lần
  useEffect(() => {
    if (paymentInfo?.paymentId) {
      const effectId = Math.random().toString(36).substring(2, 8);
      console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} running for paymentId: ${paymentInfo.paymentId}`);
      console.log(`[WS-DEBUG-COMPONENT] Effect dependencies:`, { paymentId: paymentInfo?.paymentId, onPaymentSuccess });
      
      // Ngắt kết nối cũ nếu có
      console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} calling disconnect`);
      paymentWebSocketService.disconnect();
      
      // Thiết lập WebSocket event listeners
      const onStatusChange = (status: WebSocketStatus) => {
        console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} status change handler called with status:`, status);
        setWebsocketStatus(status);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onMessage = (data: any) => {
        console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} message handler called with data:`, data);
        
        if (data.type === 'payment_status') {
          // Kiểm tra xem tin nhắn này đã được xử lý chưa
          if (paymentWebSocketService.isMessageProcessed && paymentWebSocketService.isMessageProcessed(data)) {
            console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} Skipping duplicate message:`, data);
            return;
          }
          
          // Đánh dấu tin nhắn đã được xử lý để tránh xử lý lại
          if (paymentWebSocketService.markMessageAsProcessed) {
            paymentWebSocketService.markMessageAsProcessed(data);
            console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} Marked message as processed:`, data);
          }
          
          console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} Setting payment status to:`, data.status);
          setPaymentStatus(data.status as PaymentStatus);
          
          // Show appropriate toast based on status
          if (data.status === 'payment_received') {
            toast({
              title: "Đã nhận thanh toán",
              description: "Hệ thống đang xử lý thanh toán của bạn",
              variant: "default",
            });
          } else if (data.status === 'processing') {
            toast({
              title: "Đang xử lý",
              description: "Vé của bạn đang được chuẩn bị",
              variant: "default",
            });
          } else if (data.status === 'completed') {
            toast({
              title: "Thanh toán thành công",
              description: "Vé đã được gửi tới email của bạn",
              variant: "success",
            });
            // Trigger success callback after a short delay
            setTimeout(() => {
              onPaymentSuccess();
            }, 1500);
          } else if (data.status === 'failed') {
            toast({
              title: "Thanh toán thất bại",
              description: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác",
              variant: "destructive",
            });
          }
        }
      };

      // In ra object listeners hiện tại trước khi đăng ký mới
      console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} Registering event listeners`);
      
      // Đăng ký event listeners trước khi kết nối
      paymentWebSocketService.on('status_change', onStatusChange);
      paymentWebSocketService.on('message', onMessage);
      
      // Thực hiện kết nối
      console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} Calling connect with paymentId: ${paymentInfo.paymentId}`);
      paymentWebSocketService.connect(paymentInfo.paymentId);

      // Clean up event listeners và ngắt kết nối khi component unmount
      return () => {
        console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} cleanup function running`);
        paymentWebSocketService.off('status_change', onStatusChange);
        paymentWebSocketService.off('message', onMessage);
        paymentWebSocketService.disconnect();
        console.log(`[WS-DEBUG-COMPONENT] Effect #${effectId} cleanup completed`);
      };
    }
  }, [paymentInfo?.paymentId, onPaymentSuccess]);

  // Start payment process immediately when component mounts
  useEffect(() => {
    startPayment().catch(err => {
      console.error("Failed to start payment:", err);
    });
  }, []);

  // This would handle the download of the QR code image
  const handleDownloadQR = () => {
    if (!paymentInfo) return;
    
    // Generate QR URL
    const qrUrl = `https://qr.sepay.vn/img?acc=${paymentInfo.soTaiKhoan}&bank=${paymentInfo.nganHang}&amount=${paymentInfo.soTien}&des=${paymentInfo.noiDung}`;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `thanh-toan-${paymentInfo.noiDung}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Đã tải xuống mã QR",
      description: "Mã QR đã được tải xuống thành công",
      variant: "success"
    });
  };

  // Render appropriate status alert
  const renderStatusAlert = () => {
    switch(paymentStatus) {
      case 'waiting_payment':
        return (
          <Alert className="border-primary/50 bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-primary flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium flex items-center gap-1">
                Chờ thanh toán
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              </span>
            </AlertDescription>
          </Alert>
        );
      case 'payment_received':
        return (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm text-amber-500 flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium flex items-center gap-1">
                Đã nhận thanh toán
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              </span>
            </AlertDescription>
          </Alert>
        );
      case 'processing':
        return (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
            <AlertDescription className="text-sm text-amber-500 flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Đang xử lý</span>
            </AlertDescription>
          </Alert>
        );
      case 'completed':
        return (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-sm text-green-500 flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Thanh toán thành công</span>
            </AlertDescription>
          </Alert>
        );
      case 'failed':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Thanh toán thất bại</span>
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // If there's an error with availability
  if (error) {
    return (
      <ScrollToTop>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error.message}
            </AlertDescription>
          </Alert>
          
          <div className="text-center text-muted-foreground text-sm">
            <p>Bạn sẽ được chuyển về trang chi tiết trong vài giây...</p>
          </div>
          
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => navigate(`/occas/${occaId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chi tiết
          </Button>
        </div>
      </ScrollToTop>
    );
  }

  // Loading state
  if (isProcessing || !paymentInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang khởi tạo thanh toán...</p>
      </div>
    );
  }

  // Generate QR URL
  const qrUrl = `https://qr.sepay.vn/img?acc=${paymentInfo.soTaiKhoan}&bank=${paymentInfo.nganHang}&amount=${paymentInfo.soTien}&des=${paymentInfo.noiDung}`;
  
  // Should we disable the UI when payment is completed or failed
  const isPaymentFinished = paymentStatus === 'completed' || paymentStatus === 'failed';

  return (
    <ScrollToTop>
      <div className="space-y-6">
        {renderStatusAlert()}

        {/* QR Code */}
        <Card className={isPaymentFinished ? "opacity-60" : ""}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">Quét mã QR để thanh toán</h3>
              
              <div className="relative">
                <img 
                  src={qrUrl}
                  alt="Mã QR thanh toán"
                  className="max-w-full h-auto max-h-64 rounded-lg"
                />
                {isPaymentFinished && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    {paymentStatus === 'completed' ? (
                      <span className="text-green-500 font-medium flex items-center gap-1">
                        <CheckCircle className="h-5 w-5" />
                        Thanh toán thành công
                      </span>
                    ) : (
                      <span className="text-destructive font-medium">Thanh toán thất bại</span>
                    )}
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                onClick={handleDownloadQR}
                className="w-full sm:w-auto"
                disabled={isPaymentFinished}
              >
                <Download className="mr-2 h-4 w-4" />
                Tải mã QR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className={isPaymentFinished ? "opacity-60" : ""}>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-medium">Thông tin chuyển khoản</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngân hàng:</span>
                <span className="font-medium">{paymentInfo.nganHang}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tài khoản:</span>
                <span className="font-medium">{paymentInfo.soTaiKhoan}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-medium text-primary">
                  {paymentInfo.soTien.toLocaleString('vi-VN')}đ
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nội dung:</span>
                <span className="font-medium">{paymentInfo.noiDung}</span>
              </div>
            </div>

            <Separator className="my-2" />
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Vui lòng chuyển khoản đúng số tiền và nội dung</li>
                <li>Hệ thống sẽ tự động xác nhận khi nhận được thanh toán</li>
                <li>Vé sẽ được gửi tới email của bạn ngay sau khi thanh toán thành công</li>
                <li>Nếu không nhận được vé sau 15 phút, vui lòng liên hệ với chúng tôi</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={paymentStatus !== 'waiting_payment'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    </ScrollToTop>
  );
};