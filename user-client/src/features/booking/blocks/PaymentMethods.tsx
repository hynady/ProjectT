import { useState } from 'react';
import { Card, CardContent } from '@/commons/components/card.tsx';
import { RadioGroup, RadioGroupItem } from '@/commons/components/radio-group.tsx';
import { Label } from '@/commons/components/label.tsx';
import { Button } from '@/commons/components/button.tsx';
import { QrCode, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollToTop } from "@/commons/blocks/ScrollToTop.tsx";
import { ConfirmCancelDialog } from "@/features/booking/components/ConfirmCancelDialog.tsx";
import { PaymentDetails } from '@/features/booking/internal-types/booking.type';
import { QRPayment } from './QRPayment';
import { bookingService } from '@/features/booking/services/booking.service';
import { toast } from '@/commons/hooks/use-toast';

const paymentMethods = [
  {
    id: 'qr_code',
    title: 'Quét mã QR',
    description: 'Quét mã để thanh toán qua ứng dụng ngân hàng',
    icon: <QrCode className="h-5 w-5"/>
  }
];

interface PaymentMethodsProps {
  occaId: string;
  paymentInfo: PaymentDetails | null;
  onPaymentSuccess: () => void;
}

export const PaymentMethods = ({
  occaId,
  paymentInfo,
  onPaymentSuccess
}: PaymentMethodsProps) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('qr_code'); // Default to QR code
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [fullPaymentInfo, setFullPaymentInfo] = useState<PaymentDetails | null>(null);

  
  const handleContinue = async () => {
    if (!selectedMethod || !paymentInfo) return;
    
    try {      
      // Chỉ lấy thông tin tài khoản ngân hàng khi người dùng nhấn nút thanh toán
      const bankInfo = await bookingService.getPaymentInfo(paymentInfo.paymentId);
      
      // Kết hợp thông tin thanh toán cơ bản và thông tin tài khoản ngân hàng
      setFullPaymentInfo({
        ...paymentInfo,
        ...bankInfo
      });
      
      // Hiển thị giao diện thanh toán QR
      setShowPayment(true);
      
    } catch (error) {
      // Xử lý lỗi khi không thể lấy thông tin ngân hàng
      toast({
        title: "Không thể lấy thông tin thanh toán",
        description: (error as Error).message || "Vui lòng thử lại sau",
        variant: "destructive",
      });
    } 
  };

  const handleChangePaymentMethod = () => {
    // Quay lại màn hình chọn phương thức thanh toán
    setShowPayment(false);
  };

  // Show QR payment immediately if already selected
  if (showPayment) {
    if (!fullPaymentInfo) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin thanh toán...</p>
        </div>
      );
    }
    
    return (
      <QRPayment
        occaId={occaId}
        paymentInfo={fullPaymentInfo}
        onPaymentSuccess={onPaymentSuccess}
        onChangePaymentMethod={handleChangePaymentMethod}
      />
    );
  }

  return (
    <ScrollToTop>
      <div className="space-y-6">
        <RadioGroup
          value={selectedMethod}
          onValueChange={setSelectedMethod}
          className="space-y-4"
        >
          {paymentMethods.map((method) => (
            <Card key={method.id}
                  className={`relative transition-colors cursor-pointer ${selectedMethod === method.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}>
              <CardContent className="flex items-center p-4">
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="absolute left-4"
                />
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-4 ml-8 cursor-pointer w-full"
                >
                  <div className="text-primary">{method.icon}</div>
                  <div>
                    <div className="font-medium">{method.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.description}
                    </div>
                  </div>
                </Label>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>

        <div className="flex justify-end">

          <Button
            onClick={handleContinue}
            disabled={!selectedMethod}
            className="col-span-2"
          >
            Tiếp tục
          </Button>
        </div>

        <ConfirmCancelDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={() => navigate(`/occas/${occaId}`)}
        />
      </div>
    </ScrollToTop>
  );
};