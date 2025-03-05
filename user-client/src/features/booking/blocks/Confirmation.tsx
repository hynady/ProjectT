// components/Payment.tsx
import { Card, CardContent, CardHeader } from '@/commons/components/card.tsx';
import { Button } from '@/commons/components/button.tsx';
import {format} from "date-fns";
import {vi} from "date-fns/locale";
import {Separator} from "@/commons/components/separator.tsx";
import { BookingState, OccaShortInfo } from '@/features/booking/internal-types/booking.type';


interface ConfirmationProps {
  bookingState: BookingState;
  occaInfo: OccaShortInfo;
  onConfirmPayment: () => void;
  onBack: () => void;
}

export const Confirmation = ({ bookingState, occaInfo, onConfirmPayment, onBack }: ConfirmationProps) => {
  return (
    <div className="space-y-6">
      {/* Thông tin sự kiện */}
      <Card>
        <CardHeader className="text-lg font-semibold pb-2">
          Thông tin sự kiện
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-primary">
                {occaInfo.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Địa điểm:</p>
                <p className="text-muted-foreground">{occaInfo.location}</p>
              </div>
              <div>
                <p className="font-semibold">Thời lượng:</p>
                <p className="text-muted-foreground">{occaInfo.duration}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-semibold">Địa chỉ:</p>
              <p className="text-muted-foreground">{occaInfo.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-lg font-semibold pb-2">
          Thông tin nhận vé
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid gap-4">
              <div>
                <p className="font-semibold mb-1.5">Họ và tên người nhận:</p>
                <p className="text-muted-foreground">Huỳnh Nam Duy</p>
              </div>
              <div>
                <p className="font-semibold mb-1.5">Email nhận vé:</p>
                <p className="text-muted-foreground">hynady@example.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chi tiết đặt vé */}
      <Card>
        <CardHeader className="text-lg font-semibold pb-2">
          Chi tiết đặt vé
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Suất diễn:</span>
            <span>
              {format(
                new Date(bookingState.selectedShow?.date || ''),
                'EEEE, dd/MM/yyyy',
                { locale: vi }
              )} - {bookingState.selectedShow?.time}
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="font-medium">Vé đã chọn:</p>
            {bookingState.selectedTickets.map((ticket, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{ticket.type} x{ticket.quantity}</span>
                <span className="font-medium">
                  {(ticket.price * ticket.quantity)
                    .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Tổng tiền:</span>
            <span className="text-primary">
              {bookingState.totalAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end mt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Quay lại
        </Button>
        <Button
          onClick={onConfirmPayment}
        >
          Xác nhận và Thanh toán
        </Button>
      </div>
    </div>
  );
};