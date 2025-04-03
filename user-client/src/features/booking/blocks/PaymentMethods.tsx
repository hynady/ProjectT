import { useState } from 'react';
import { Card, CardContent } from '@/commons/components/card.tsx';
import { RadioGroup, RadioGroupItem } from '@/commons/components/radio-group.tsx';
import { Label } from '@/commons/components/label.tsx';
import { Button } from '@/commons/components/button.tsx';
import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollToTop } from "@/commons/blocks/ScrollToTop.tsx";
import { ConfirmCancelDialog } from "@/features/booking/components/ConfirmCancelDialog.tsx";
import { BookingState } from '@/features/booking/internal-types/booking.type';
import { QRPayment } from './QRPayment';

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
  showId: string;
  tickets: BookingState['selectedTickets'];
  onBack: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentMethods = ({
  occaId,
  showId,
  tickets,
  onBack,
  onPaymentSuccess
}: PaymentMethodsProps) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('qr_code'); // Default to QR code
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const handlePayment = () => {
    if (!selectedMethod) return;
    setShowPayment(true);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    navigate(`/occas/${occaId}`);
  };

  // Show QR payment immediately if already selected
  if (showPayment) {
    return (
      <QRPayment
        occaId={occaId}
        showId={showId}
        tickets={tickets.map(t => ({
          id: t.id,
          type: t.type,
          quantity: t.quantity
        }))}
        onBack={() => setShowPayment(false)}
        onPaymentSuccess={onPaymentSuccess}
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

        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="col-span-1"
          >
            Quay lại
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelClick}
            className="col-span-1"
          >
            Hủy đặt vé
          </Button>
          <Button
            className="col-span-1"
            disabled={!selectedMethod}
            onClick={handlePayment}
          >
            Tiếp tục
          </Button>
        </div>

        <ConfirmCancelDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancelConfirm}
        />
      </div>
    </ScrollToTop>
  );
};