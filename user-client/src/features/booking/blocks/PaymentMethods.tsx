import {useState} from 'react';
import {Card, CardContent} from '@/commons/components/card.tsx';
import {RadioGroup, RadioGroupItem} from '@/commons/components/radio-group.tsx';
import {Label} from '@/commons/components/label.tsx';
import {Button} from '@/commons/components/button.tsx';
import {CreditCard, Wallet, QrCode} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {ScrollToTop} from "@/commons/blocks/ScrollToTop.tsx";
import {ConfirmCancelDialog} from "@/features/booking/components/ConfirmCancelDialog.tsx";

const paymentMethods = [
  {
    id: 'credit_card',
    title: 'Thẻ tín dụng/ghi nợ',
    description: 'Thanh toán bằng Visa, Mastercard, JCB',
    icon: <CreditCard className="h-5 w-5"/>
  },
  {
    id: 'e_wallet',
    title: 'Ví điện tử',
    description: 'Momo, ZaloPay, VNPay',
    icon: <Wallet className="h-5 w-5"/>
  },
  {
    id: 'qr_code',
    title: 'Quét mã QR',
    description: 'Quét mã để thanh toán qua ứng dụng ngân hàng',
    icon: <QrCode className="h-5 w-5"/>
  }
];

interface PaymentMethodsProps {
  onPaymentComplete: () => void;
  occaId: string;
  onBack: () => void;
}

export const PaymentMethods = ({onPaymentComplete, occaId, onBack}: PaymentMethodsProps) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    // Giả lập quá trình thanh toán
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentComplete();
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    navigate(`/occas/${occaId}`);
  };

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
            disabled={isProcessing}
            className="col-span-1"
          >
            Quay lại
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelClick}
            disabled={isProcessing}
            className="col-span-1"
          >
            Hủy đặt vé
          </Button>
          <Button
            className="col-span-1"
            disabled={!selectedMethod || isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
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