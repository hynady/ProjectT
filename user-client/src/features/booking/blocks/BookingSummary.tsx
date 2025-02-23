import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import {Card, CardContent} from '@/commons/components/card.tsx';
import {Separator} from '@/commons/components/separator.tsx';
import {Alert, AlertDescription} from "@/commons/components/alert.tsx"
import {InfoIcon} from "lucide-react"
import {BookingState, OccaShortInfo} from "@/features/booking/blocks/Confirmation.tsx";
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Timer} from "lucide-react";

interface BookingSummaryProps {
  occaId: string;
  bookingState: BookingState;
  occaInfo: OccaShortInfo;
  step: number;
}

export const BookingSummary = ({bookingState, occaInfo, step, occaId}: BookingSummaryProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây

  useEffect(() => {
    if (timeLeft === 0) {
      navigate(`/occas/${occaId}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, occaId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const countdown = (
    <Alert className="mb-4 border-destructive/50 bg-destructive/10">
      <Timer className="h-4 w-4 text-destructive"/>
      <AlertDescription className="text-sm text-destructive">
        Vui lòng hoàn tất đặt vé trong: {formatTime(timeLeft)}
      </AlertDescription>
    </Alert>
  );

  if (step === 0) return null;

  // Hiển thị thông báo nhắc nhở ở step 3
  if (step === 3) {
    return (
      <Card>
        <CardContent className="p-4">
          {countdown}
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

  // Hiển thị summary bình thường cho các step khác
  return (
    <Card>
      <CardContent className="p-4">
        {countdown}
        <div className="space-y-4">
          {/* Thông tin Occa */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base text-foreground">
              {occaInfo.title}
            </h3>
            <div className="flex items-start gap-2">
              <div className="text-muted-foreground min-w-[80px]">Thời lượng:</div>
              <div>{occaInfo.duration}</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-muted-foreground min-w-[80px]">Địa điểm:</div>
              <div>{occaInfo.location}</div>
            </div>
            <div className="text-sm flex items-start gap-2">
              <div className="text-muted-foreground min-w-[80px]">Địa chỉ:</div>
              <div className="text-pretty">{occaInfo.address}</div>
            </div>
          </div>

          <Separator/>

          {/* Thông tin đã chọn */}
          <div className="space-y-3 text-sm">
            {/* Suất đã chọn */}
            {bookingState.selectedShow && (
              <div className="flex items-start gap-2">
                <div className="text-muted-foreground min-w-[80px]">Suất:</div>
                <div>
                  {format(new Date(bookingState.selectedShow.date), 'EEEE, dd/MM/yyyy', {locale: vi})}
                  <span className="mx-1">-</span>
                  {bookingState.selectedShow.time}
                </div>
              </div>
            )}

            {/* Vé đã chọn - chỉ hiển thị khi có vé */}
            {bookingState.selectedTickets.length > 0 && (
              <>
                <div className="flex items-start gap-2">
                  <div className="text-muted-foreground min-w-[80px]">Vé:</div>
                  <div className="space-y-1">
                    {bookingState.selectedTickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {ticket.type} x {ticket.quantity}
                        </span>
                        <span className="text-primary ml-4">
                          {(ticket.price * ticket.quantity)
                            .toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-2"/>

                {/* Tổng tiền */}
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="text-primary">
                    {bookingState.totalAmount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};