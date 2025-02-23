// components/PaymentSuccess.tsx
import {Check} from 'lucide-react';
import {Button} from '@/commons/components/button.tsx';
import {useNavigate} from 'react-router-dom';
import Confetti from 'react-confetti';
import { ScrollToTop } from '@/commons/blocks/ScrollToTop.tsx';

export const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <ScrollToTop>
      <div className="text-center space-y-6">
        <Confetti
          recycle={false}
          numberOfPieces={200}
        />

        <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="h-6 w-6 text-primary"/>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Thanh toán thành công!</h3>
          <p className="text-muted-foreground">
            Vé của bạn cũng đã được gửi đến email. Vui lòng kiểm tra và mang theo khi đến xem.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => navigate('/my-ticket')}
          >
            Xem vé của tôi
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    </ScrollToTop>
  );
};