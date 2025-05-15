import { useState } from 'react';
import { Button } from '@/commons/components/button';
import { Input } from '@/commons/components/input';
import { useNavigate } from 'react-router-dom';
import { ticketCheckInService } from './ticket-check-in.service';
import { toast } from '@/commons/hooks/use-toast';
import { TicketCheckInLayout } from './TicketCheckInLayout';

export const ShowAuthPage = () => {
  const [showAuthCode, setShowAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAuthCode) {
      toast({
        variant: 'destructive',
        title: 'Mã xác thực không được để trống',
        description: 'Vui lòng nhập mã xác thực để tiếp tục',
      });
      return;
    }

    setIsLoading(true);
    try {      const response = await ticketCheckInService.verifyShowAuthCode(showAuthCode);
      if (response && response.exists) {
        // Save to localStorage with expiry time
        localStorage.setItem('showAuthCode', showAuthCode);
        localStorage.setItem('showAuthExpiry', response.expiresAt);
        
        // Navigate to ticket list page instead
        navigate('/ticket-check-in/tickets');
      } else {
        toast({
          variant: 'destructive',
          title: 'Mã xác thực không hợp lệ',
          description: 'Mã xác thực không tồn tại hoặc đã hết hạn',
        });
      }
    } catch (error) {      console.error('Error verifying code:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi hệ thống',
        description: 'Có lỗi xảy ra khi xác thực mã. Vui lòng thử lại sau.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TicketCheckInLayout>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">Xác thực sự kiện</h2>
          <p className="mt-2 text-muted-foreground">Nhập mã xác thực để bắt đầu check-in vé</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="showAuthCode" className="text-sm font-medium text-foreground">
                Mã xác thực sự kiện
              </label>
              <Input
                id="showAuthCode"
                placeholder="Nhập mã xác thực"
                value={showAuthCode}
                onChange={(e) => setShowAuthCode(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Nhập mã xác thực được cung cấp bởi ban tổ chức sự kiện.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
          </form>
        </div>
      </div>
    </TicketCheckInLayout>
  );
};

export default ShowAuthPage;
