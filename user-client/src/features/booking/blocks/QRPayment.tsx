import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/commons/components/card';
import { Button } from '@/commons/components/button';
import { PaymentDetails } from '@/features/booking/internal-types/booking.type';
import { AlertCircle, ArrowLeft, Clock, Download, Loader2, CheckCircle, Timer } from 'lucide-react';
import { Alert, AlertDescription } from '@/commons/components/alert';
import { ScrollToTop } from '@/commons/blocks/ScrollToTop';
import { Separator } from '@/commons/components/separator';
import { usePaymentProcess } from '../hooks/usePaymentProcess';
import { toast } from '@/commons/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { paymentWebSocketService, PaymentMessage, PaymentStatus } from '../services/payment-websocket.service';
import { Progress } from '@/commons/components/progress';

// Thời gian thanh toán tối đa (15 phút = 900 giây)
const PAYMENT_TIMEOUT_SECONDS = 900;

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

export const QRPayment = ({
  occaId,
  showId,
  tickets,
  onBack,
  onPaymentSuccess
}: QRPaymentProps) => {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<PaymentDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.WAITING_PAYMENT);
  
  // State cho đồng hồ đếm ngược
  const [timeRemaining, setTimeRemaining] = useState<number>(PAYMENT_TIMEOUT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { isProcessing, error, startPayment } = usePaymentProcess({
    bookingData: {
      showId,
      tickets
    },
    occaId,
    onSuccess: (details) => {
      setPaymentInfo(details);
      // Khởi tạo thời gian đếm ngược khi có thông tin thanh toán
      setTimeRemaining(PAYMENT_TIMEOUT_SECONDS);
    },
    onError: (error) => {
      toast({
        title: "Không thể xử lý thanh toán",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Type guard để kiểm tra tin nhắn có phải là PaymentMessage không
  const isPaymentStatusMessage = (data: unknown): data is PaymentMessage => {
    if (typeof data !== 'object' || data === null) return false;
    
    const message = data as Partial<PaymentMessage>;
    return message.type === 'payment_status' && typeof message.status === 'string';
  };

  // Xử lý khi hết thời gian thanh toán
  const handlePaymentTimeout = useCallback(() => {
    // Cập nhật trạng thái thanh toán thành hết hạn
    setPaymentStatus(PaymentStatus.EXPIRED);
    
    // Hiển thị thông báo
    toast({
      title: "Hết thời gian thanh toán",
      description: "Phiên thanh toán đã hết hạn. Vui lòng thử lại.",
      variant: "destructive",
    });
    
    // Ngắt kết nối WebSocket
    paymentWebSocketService.disconnect();
    
    // Xóa timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Bắt đầu đếm ngược khi có thông tin thanh toán
  useEffect(() => {
    if (paymentInfo && paymentStatus === PaymentStatus.WAITING_PAYMENT) {
      // Đảm bảo xóa timer cũ nếu có
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Thiết lập timer mới
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Nếu hết thời gian, xử lý timeout
            handlePaymentTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paymentInfo, paymentStatus, handlePaymentTimeout]);

  // Dừng đếm ngược khi thanh toán thành công hoặc thất bại
  useEffect(() => {
    if (
      paymentStatus === PaymentStatus.COMPLETED || 
      paymentStatus === PaymentStatus.FAILED ||
      paymentStatus === PaymentStatus.EXPIRED
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [paymentStatus]);

  // Kết nối WebSocket khi paymentInfo có sẵn - chỉ kết nối một lần
  useEffect(() => {
    if (paymentInfo?.paymentId) {
      // Ngắt kết nối cũ nếu có
      paymentWebSocketService.disconnect();

      const onMessage = (data: unknown) => {
        // Sử dụng type guard để kiểm tra cấu trúc đúng của PaymentMessage
        if (isPaymentStatusMessage(data) && data.type === 'payment_status') {
          const status = data.status as PaymentStatus;
          setPaymentStatus(status);
          
          // Show appropriate toast based on status
          if (status === PaymentStatus.PAYMENT_RECEIVED) {
            toast({
              title: "Đã nhận thanh toán",
              description: "Hệ thống đang xử lý thanh toán của bạn",
              variant: "default",
            });
          } else if (status === PaymentStatus.PROCESSING) {
            toast({
              title: "Đang xử lý",
              description: "Vé của bạn đang được chuẩn bị",
              variant: "default",
            });
          } else if (status === PaymentStatus.COMPLETED) {
            toast({
              title: "Thanh toán thành công",
              description: "Vé đã được gửi tới email của bạn",
              variant: "success",
            });
            // Trigger success callback after a short delay
            setTimeout(() => {
              onPaymentSuccess();
            }, 1500);
          } else if (status === PaymentStatus.FAILED) {
            toast({
              title: "Thanh toán thất bại",
              description: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác",
              variant: "destructive",
            });
          }
        }
      };
      
      // Đăng ký event listeners trước khi kết nối
      paymentWebSocketService.on('message', onMessage);
      
      // Thực hiện kết nối sử dụng phương thức mới
      paymentWebSocketService.connectToPayment(paymentInfo.paymentId);

      // Clean up event listeners và ngắt kết nối khi component unmount
      return () => {
        paymentWebSocketService.off('message', onMessage);
        paymentWebSocketService.disconnect();
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

  // Format time remaining để hiển thị
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Tính toán phần trăm thời gian còn lại
  const timeRemainingPercentage = (timeRemaining / PAYMENT_TIMEOUT_SECONDS) * 100;

  // Render appropriate status alert
  const renderStatusAlert = () => {
    switch(paymentStatus) {
      case PaymentStatus.WAITING_PAYMENT:
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
      case PaymentStatus.PAYMENT_RECEIVED:
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
      case PaymentStatus.PROCESSING:
        return (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
            <AlertDescription className="text-sm text-amber-500 flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Đang xử lý</span>
            </AlertDescription>
          </Alert>
        );
      case PaymentStatus.COMPLETED:
        return (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-sm text-green-500 flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Thanh toán thành công</span>
            </AlertDescription>
          </Alert>
        );
      case PaymentStatus.FAILED:
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Thanh toán thất bại</span>
            </AlertDescription>
          </Alert>
        );
      case PaymentStatus.EXPIRED:
        return (
          <Alert variant="destructive">
            <Timer className="h-4 w-4" />
            <AlertDescription className="text-sm flex items-center gap-1">
              <span>Trạng thái:</span> 
              <span className="font-medium">Hết thời gian thanh toán</span>
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Render countdown timer
  const renderCountdownTimer = () => {
    if (
      paymentStatus !== PaymentStatus.WAITING_PAYMENT || 
      !paymentInfo
    ) {
      return null;
    }

    // Xác định màu sắc dựa trên thời gian còn lại
    let progressColor = "bg-primary";
    if (timeRemaining < 300) { // Dưới 5 phút
      progressColor = "bg-amber-500";
    }
    if (timeRemaining < 60) { // Dưới 1 phút
      progressColor = "bg-red-500";
    }

    return (
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium flex items-center gap-1">
            <Timer className="h-4 w-4" />
            Thời gian còn lại:
          </span>
          <span className={`font-bold ${timeRemaining < 60 ? 'text-red-500' : timeRemaining < 300 ? 'text-amber-500' : 'text-primary'}`}>
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        <Progress className="h-2" value={timeRemainingPercentage} 
          style={{ 
            '--progress-background': progressColor 
          } as React.CSSProperties}
        />
      </div>
    );
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
  
  // Should we disable the UI when payment is completed or failed or expired
  const isPaymentFinished = 
    paymentStatus === PaymentStatus.COMPLETED || 
    paymentStatus === PaymentStatus.FAILED || 
    paymentStatus === PaymentStatus.EXPIRED;

  return (
    <ScrollToTop>
      <div className="space-y-6">
        {renderStatusAlert()}
        
        {/* Countdown Timer */}
        {renderCountdownTimer()}

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
                    {paymentStatus === PaymentStatus.COMPLETED ? (
                      <span className="text-green-500 font-medium flex items-center gap-1">
                        <CheckCircle className="h-5 w-5" />
                        Thanh toán thành công
                      </span>
                    ) : paymentStatus === PaymentStatus.EXPIRED ? (
                      <span className="text-destructive font-medium flex items-center gap-1">
                        <Timer className="h-5 w-5" />
                        Hết thời gian thanh toán
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
                <li>Phiên thanh toán chỉ có hiệu lực trong <span className="font-medium">{Math.floor(PAYMENT_TIMEOUT_SECONDS/60)} phút</span></li>
                <li>Nếu không nhận được vé sau 15 phút, vui lòng liên hệ với chúng tôi</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={paymentStatus !== PaymentStatus.WAITING_PAYMENT}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          
          {paymentStatus === PaymentStatus.EXPIRED && (
            <Button 
              onClick={() => {
                // Khởi tạo lại quá trình thanh toán
                setTimeRemaining(PAYMENT_TIMEOUT_SECONDS);
                startPayment().catch(err => {
                  console.error("Failed to restart payment:", err);
                });
              }}
            >
              <Timer className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
        </div>
      </div>
    </ScrollToTop>
  );
};