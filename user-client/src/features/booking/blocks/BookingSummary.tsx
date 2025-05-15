import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import {Card, CardContent} from '@/commons/components/card.tsx';
import {Separator} from '@/commons/components/separator.tsx';
import {Alert, AlertDescription} from "@/commons/components/alert.tsx"
import {InfoIcon, User, Calendar, MapPin, TicketIcon, Clock, AlertTriangle} from "lucide-react"
import { BookingState, OccaShortInfo } from '@/features/booking/internal-types/booking.type';
import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/commons/components/progress.tsx';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/commons/hooks/use-toast';

interface BookingSummaryProps {
  occaId: string;
  bookingState: BookingState;
  occaInfo: OccaShortInfo;
  step: number;
  isPaymentSuccess?: boolean;
}

export const BookingSummary = ({bookingState, occaInfo, step, occaId, isPaymentSuccess = false}: BookingSummaryProps) => {
  const navigate = useNavigate();
  // Thời gian khóa vé là 10 phút (600 giây)
  const LOCK_TIMEOUT_SECONDS = 600;
  const [timeRemaining, setTimeRemaining] = useState(LOCK_TIMEOUT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Xử lý khi hết thời gian
  const handleTimeout = () => {
    // Hiển thị thông báo
    toast({
      title: "Hết thời gian đặt vé",
      description: "Phiên đặt vé đã hết hạn. Bạn sẽ được chuyển về trang chi tiết sự kiện.",
      variant: "destructive",
    });
    
    // Chuyển hướng về trang chi tiết sau 3 giây
    setTimeout(() => {
      navigate(`/occas/${occaId}`);
    }, 3000);
  };
  
  // Khởi tạo đếm ngược khi bước là 4 (bước thanh toán) và chưa thanh toán thành công
  useEffect(() => {
    if (step === 4 && !isPaymentSuccess) {
      // Bắt đầu đếm ngược
      setTimeRemaining(LOCK_TIMEOUT_SECONDS);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Xóa timer khi hết thời gian
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Xử lý timeout
            handleTimeout();
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Xóa timer khi không ở bước thanh toán hoặc đã thanh toán thành công
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    // Cleanup khi component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step, occaId, isPaymentSuccess]);
  
  // Format thời gian còn lại
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Tính phần trăm thời gian còn lại
  const calculateTimePercentage = (): number => {
    return (timeRemaining / LOCK_TIMEOUT_SECONDS) * 100;
  };
  
  if (step === 0) return null;

  // Hiển thị thông báo nhắc nhở ở step 3
  if (step === 3) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert className="border-primary/50 bg-primary/10">
            <InfoIcon className="h-4 w-4 text-primary"/>
            <AlertDescription className="text-sm text-primary">
              Vui lòng kiểm tra kỹ các thông tin sau trước khi xác nhận:
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Tên sự kiện và địa điểm</li>
                <li>Ngày giờ diễn</li>
                <li>Số lượng và loại vé</li>
                <li>Tổng số tiền thanh toán</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Hiển thị thông báo đếm ngược thời gian ở step 4
  if (step === 4) {
    return (
      <Card>
        <CardContent className="p-4 md:p-5">
          {/* Countdown section - Hiển thị đầu tiên */}
          <Alert className="border-destructive/50 bg-destructive/10 mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive"/>
            <AlertDescription className="text-sm text-destructive">
              Vui lòng hoàn tất thanh toán trong thời gian còn lại:
              <div className="mt-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="font-bold">{formatTimeRemaining(timeRemaining)}</span>
              </div>
              <Progress value={calculateTimePercentage()} className="mt-2" />
            </AlertDescription>
          </Alert>

          {/* Header section */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-foreground mb-1">
              Thông tin đặt vé
            </h3>
            <p className="text-sm text-muted-foreground">
              {occaInfo.title}
            </p>
          </div>

          <Separator className="my-3"/>

          {/* Main content */}
          <div className="space-y-4">
            {/* Event info section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Địa điểm:</span>
                <span className="font-medium truncate">{occaInfo.location}</span>
              </div>
              
              {bookingState.selectedShow && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Suất diễn:</span>
                  <span className="font-medium">
                    {format(new Date(bookingState.selectedShow.date), 'dd/MM/yyyy', {locale: vi})}
                    <span className="mx-1">•</span>
                    {bookingState.selectedShow.time}
                  </span>
                </div>
              )}
              
              {bookingState.selectedProfile && (
                <div className="flex items-start gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">Thông tin người nhận:</span>
                    <div className="mt-2 border rounded-md p-3 bg-muted/20 space-y-2">
                      <div className="flex items-center">
                        <span className="text-muted-foreground min-w-[54px]">Tên:</span>
                        <span className="font-medium">{bookingState.selectedProfile.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground min-w-[54px]">SĐT:</span>
                        <span className="font-medium">{bookingState.selectedProfile.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground min-w-[54px]">Email:</span>
                        <span className="font-medium">{bookingState.selectedProfile.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tickets section */}
            {bookingState.selectedTickets.length > 0 && (
              <>
                <Separator className="my-3" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <TicketIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Vé đã chọn:</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {bookingState.selectedTickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {ticket.type} <span className="text-muted-foreground">x{ticket.quantity}</span>
                        </span>
                        <span className="font-medium">
                          {(ticket.price * ticket.quantity)
                            .toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tổng tiền:</span>
                    <span className="text-primary font-bold text-lg">
                      {bookingState.totalAmount.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hiển thị summary bình thường cho các step khác
  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        {/* Header section */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-foreground mb-1">
            Thông tin đặt vé
          </h3>
          <p className="text-sm text-muted-foreground">
            {occaInfo.title}
          </p>
        </div>

        <Separator className="my-3"/>

        {/* Main content */}
        <div className="space-y-4">
          {/* Event info section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Địa điểm:</span>
              <span className="font-medium truncate">{occaInfo.location}</span>
            </div>
            
            {bookingState.selectedShow && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Suất diễn:</span>
                <span className="font-medium">
                  {format(new Date(bookingState.selectedShow.date), 'dd/MM/yyyy', {locale: vi})}
                  <span className="mx-1">•</span>
                  {bookingState.selectedShow.time}
                </span>
              </div>
            )}
            
            {bookingState.selectedProfile && (
              <div className="flex items-start gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-muted-foreground">Thông tin người nhận:</span>
                  <div className="mt-2 border rounded-md p-3 bg-muted/20 space-y-2">
                    <div className="flex items-center">
                      <span className="text-muted-foreground min-w-[54px]">Tên:</span>
                      <span className="font-medium">{bookingState.selectedProfile.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground min-w-[54px]">SĐT:</span>
                      <span className="font-medium">{bookingState.selectedProfile.phoneNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground min-w-[54px]">Email:</span>
                      <span className="font-medium">{bookingState.selectedProfile.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tickets section */}
          {bookingState.selectedTickets.length > 0 && (
            <>
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <TicketIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Vé đã chọn:</span>
                </div>
                
                <div className="space-y-1.5">
                  {bookingState.selectedTickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {ticket.type} <span className="text-muted-foreground">x{ticket.quantity}</span>
                      </span>
                      <span className="font-medium">
                        {(ticket.price * ticket.quantity)
                          .toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng tiền:</span>
                  <span className="text-primary font-bold text-lg">
                    {bookingState.totalAmount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};