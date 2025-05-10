/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/commons/components/button';
import { Input } from '@/commons/components/input';
import { useNavigate } from 'react-router-dom';
import { ticketCheckInService } from './ticket-check-in.service';
import { toast } from '@/commons/hooks/use-toast';
import { TicketCheckInLayout } from './TicketCheckInLayout';
import './new-qr-scanner.css';
import { HTMLQRScanner } from '@/features/ticket-check-in/HTMLQRScanner';

export const TicketScanPage = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const lastScannedCode = useRef<string>('');
  const lastScanTime = useRef<number>(0);
  const processingCode = useRef<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Process ticket code (from scan or manual entry)
  const processTicket = useCallback(async (code: string) => {
    // Prevent processing the same code within 3 seconds
    const now = Date.now();
    if (code === lastScannedCode.current && now - lastScanTime.current < 3000) {
      console.log('Preventing duplicate scan', code);
      return;
    }
    
    // Update tracking variables
    lastScannedCode.current = code;
    lastScanTime.current = now;
    
    if (processingCode.current) {
      console.log('Already processing a code, waiting...');
      return;
    }
    processingCode.current = true;
    
    const showAuthCode = localStorage.getItem('showAuthCode');
    if (!showAuthCode) {
      navigate('/ticket-check-in');
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('Đang xử lý...');
    
    try {
      await ticketCheckInService.checkInTicket(showAuthCode, code);
      setStatusMessage('Check-in thành công!');
      toast({
        title: 'Check-in thành công',
        description: 'Vé đã được xác nhận thành công',
      });
      setTicketCode('');
      
      // Clear success message after 1.5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 1500);
    } catch (error: any) {
      console.error('Check-in error:', error);
      setStatusMessage('Check-in thất bại!');
      toast({
        variant: 'destructive',
        title: 'Check-in thất bại',
        description: error.response?.data?.message || 'Vé không hợp lệ hoặc đã được sử dụng',
      });
      
      // Clear error message after 1.5 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 1500);
    } finally {
      setIsLoading(false);
      processingCode.current = false;
    }
  }, [navigate]);
    // Handler for QR code scan success
  const onScanSuccess = useCallback((decodedText: string) => {
    console.log('QR code scanned:', decodedText);
    
    // Valid QR codes only - prevent processing random text
    if (decodedText && decodedText.trim().length > 0) {
      processTicket(decodedText);
    }
  }, [processTicket]);

  // Check authentication on mount
  useEffect(() => {
    // Check authentication
    const showAuthCode = localStorage.getItem('showAuthCode');
    const expiryTime = localStorage.getItem('showAuthExpiry');

    if (!showAuthCode || !expiryTime || new Date(expiryTime) < new Date()) {
      navigate('/ticket-check-in');
    }
  }, [navigate]);
  // Handle manual ticket submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode) {
      toast({
        variant: 'destructive',
        title: 'Mã vé không được để trống',
        description: 'Vui lòng nhập mã vé để tiếp tục',
      });
      return;
    }

    processTicket(ticketCode);
  };

  // Handle switching between scan and manual modes
  const handleSwitchMode = () => {
    setIsManualMode(!isManualMode);
    setStatusMessage(null);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('showAuthCode');
    localStorage.removeItem('showAuthExpiry');
    navigate('/ticket-check-in');
  };

  // Get status message color based on content
  const getStatusColor = () => {
    if (!statusMessage) return '';
    if (statusMessage.includes('thành công')) return 'text-green-500';
    if (statusMessage.includes('thất bại')) return 'text-red-500';
    return 'text-amber-500';
  };

  return (
    <TicketCheckInLayout>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Check-in vé</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSwitchMode}>
              {isManualMode ? 'Quét QR' : 'Nhập mã'}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Đổi mã
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {isManualMode ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ticketCode" className="text-sm font-medium text-foreground">
                  Mã vé
                </label>
                <Input
                  id="ticketCode"
                  placeholder="Nhập mã vé"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
              
              {statusMessage && (
                <div className={`text-center text-sm font-medium ${getStatusColor()}`}>
                  {statusMessage}
                </div>
              )}
            </form>          ) : (
            <div className="space-y-4">              <div className="text-center text-sm text-muted-foreground">
                Đặt mã QR vào khung để quét
              </div>
                <HTMLQRScanner 
                onScan={onScanSuccess}
                height={320}
                width={320}
                className="mx-auto"
              />
              
              {statusMessage && (
                <div className={`text-center text-sm font-medium ${getStatusColor()}`}>
                  {statusMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TicketCheckInLayout>
  );
};

export default TicketScanPage;