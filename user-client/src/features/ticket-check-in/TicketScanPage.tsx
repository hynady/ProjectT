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

// Declare a global variable to track timeouts
declare global {
  interface Window {
    lastStatusTimeout?: NodeJS.Timeout;
  }
}

export const TicketScanPage = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showName, setShowName] = useState<string | null>(null);
  const [showTime, setShowTime] = useState<string | null>(null);
  const navigate = useNavigate();
  const lastScannedCode = useRef<string>('');
  const lastScanTime = useRef<number>(0);
  const processingCode = useRef<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);  // Process ticket code (from scan or manual entry)
  const processTicket = useCallback(async (code: string) => {
    // Don't process if component is unmounting
    if (unmountingRef.current) {
      console.log('Component unmounting, ignoring ticket processing');
      return;
    }
    
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
      unmountingRef.current = true; // Prevent further state updates
      setTimeout(() => {
        navigate('/ticket-check-in');
      }, 100);
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('Đang xử lý...');
    
    try {
      await ticketCheckInService.checkInTicket(showAuthCode, code);
      if (!unmountingRef.current) {
        setStatusMessage('Check-in thành công!');
        toast({
          title: 'Check-in thành công',
          description: 'Vé đã được xác nhận thành công',
        });
        setTicketCode('');      }
      
      // Clear success message after 1.5 seconds
      if (window.lastStatusTimeout) {
        clearTimeout(window.lastStatusTimeout);
      }
      window.lastStatusTimeout = setTimeout(() => {
        if (!unmountingRef.current) {
          setStatusMessage(null);
        }
      }, 1500);
    } catch (error: any) {
      console.error('Check-in error:', error);
      if (!unmountingRef.current) {
        setStatusMessage('Check-in thất bại!');
        toast({
          variant: 'destructive',
          title: 'Check-in thất bại',
          description: error.response?.data?.message || 'Vé không hợp lệ hoặc đã được sử dụng',
        });
      }
      
      // Clear error message after 1.5 seconds
      if (window.lastStatusTimeout) {
        clearTimeout(window.lastStatusTimeout);
      }
      window.lastStatusTimeout = setTimeout(() => {
        if (!unmountingRef.current) {
          setStatusMessage(null);
        }
      }, 1500);
    } finally {
      if (!unmountingRef.current) {
        setIsLoading(false);
      }
      processingCode.current = false;
    }
  }, [navigate]);
    // Check authentication on mount
  useEffect(() => {
    // Check authentication
    const showAuthCode = localStorage.getItem('showAuthCode');
    const expiryTime = localStorage.getItem('showAuthExpiry');

    if (!showAuthCode || !expiryTime || new Date(expiryTime) < new Date()) {
      navigate('/ticket-check-in');
    }
  }, [navigate]);  // Handle component unmount and cleanup
  const unmountingRef = useRef(false);
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      // Mark component as unmounting to prevent state updates
      unmountingRef.current = true;
      console.log('TicketScanPage unmounting - preventing further state updates');
      
      // Clear any pending timeouts
      if (window.lastStatusTimeout) {
        clearTimeout(window.lastStatusTimeout);
      }
      
      // Find and cleanup all video elements
      document.querySelectorAll('video').forEach(video => {
        try {
          const stream = video.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log('Media track stopped during unmount');
            });
            video.srcObject = null;
          }
        } catch (err) {
          console.error('Error stopping video tracks during unmount:', err);
        }
      });
    };
  }, []);

  // Handler for QR code scan success
  const onScanSuccess = useCallback((decodedText: string) => {
    // Don't process if component is unmounting
    if (unmountingRef.current) {
      console.log('Component unmounting, ignoring scan');
      return;
    }
    
    console.log('QR code scanned:', decodedText);
    
    // Valid QR codes only - prevent processing random text
    if (decodedText && decodedText.trim().length > 0) {
      processTicket(decodedText);
    }
  }, [processTicket]);

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
  const handleSwitchMode = async () => {
    await cleanupResources();

    setIsManualMode(!isManualMode);
    setStatusMessage(null);
  };  // Handle logout
  const handleLogout = async () => {
    await cleanupResources();

    // Remove auth data
    localStorage.removeItem('showAuthCode');
    localStorage.removeItem('showAuthExpiry');
    localStorage.removeItem('showName');
    localStorage.removeItem('showTime');

    // Small delay to allow cleanup
    setTimeout(() => {
      navigate('/ticket-check-in');
    }, 100);
  };

  const handleOpenList = async () => {
    await cleanupResources();

    // Navigate to the ticket list page
    navigate('/ticket-check-in/tickets');
  };

  const cleanupResources = async () => {
    // Set unmounting flag to prevent further state updates
    unmountingRef.current = true;

    // Clear any pending timeouts
    if (window.lastStatusTimeout) {
      clearTimeout(window.lastStatusTimeout);
      window.lastStatusTimeout = undefined;
    }

    try {
      // Stop any global scanner instance
      if (window.scannerInstance) {
        console.log("Attempting to stop global scanner instance");
        if (window.scannerInstance.isScanning) {
          try {
            await window.scannerInstance.stop();
            console.log("Global scanner instance stopped successfully");
          } catch (err) {
            console.error("Error stopping global scanner instance:", err);
          }
        }
        window.scannerInstance = undefined;
      }

      // Stop all media tracks from video elements
      const videoElements = document.querySelectorAll('video');
      const stopPromises: Promise<void>[] = [];

      videoElements.forEach(video => {
        try {
          const stream = video.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => {
              const stopPromise = new Promise<void>((resolve) => {
                track.onended = () => resolve();
                track.stop();
                console.log('Media track stopped');
                setTimeout(resolve, 50);
              });
              stopPromises.push(stopPromise);
            });
            video.srcObject = null;
            video.load();
          }
        } catch (err) {
          console.error('Error cleaning up video element:', err);
        }
      });

      // Wait for all tracks to finish stopping (with a timeout)
      await Promise.race([
        Promise.all(stopPromises),
        new Promise(resolve => setTimeout(resolve, 300))
      ]);

      // Wait a short additional time to ensure all resources are released
      await new Promise(resolve => setTimeout(resolve, 200));

      // Force a garbage collection hint
      if (window.gc) {
        try {
          window.gc();
        } catch {
          // Ignore, gc() is not available in all browsers
        }
      }

      console.log('Resource cleanup complete');
    } catch (err) {
      console.error('Error during resource cleanup:', err);
    }
  };

  // Get status message color based on content
  const getStatusColor = () => {
    if (!statusMessage) return '';
    if (statusMessage.includes('thành công')) return 'text-green-500';
    if (statusMessage.includes('thất bại')) return 'text-red-500';
    return 'text-amber-500';
  };

  // Fetch show details from localStorage or API
  useEffect(() => {
    const storedShowName = localStorage.getItem('showName');
    const storedShowTime = localStorage.getItem('showTime');

    if (storedShowName) {
      setShowName(storedShowName);
    }

    if (storedShowTime) {
      setShowTime(storedShowTime);
    }
  }, []);

  return (
    <TicketCheckInLayout>
      <div className="mx-auto max-w-md">        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Check-in vé</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSwitchMode}>
              {isManualMode ? 'Quét QR' : 'Nhập mã'}
            </Button>
            <Button variant="outline" onClick={handleOpenList}>
              Danh sách vé
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Đổi mã
            </Button>
          </div>
        </div>

        <div className="mb-4 text-center">
          {showName && <h3 className="text-xl font-semibold">{showName}</h3>}
          {showTime && <p className="text-sm text-muted-foreground">{showTime}</p>}
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
                Đặt mã QR vào khung để quét              </div>
                {!unmountingRef.current && (
                  <HTMLQRScanner 
                    onScan={onScanSuccess}
                    height={320}
                    width={320}
                    className="mx-auto"
                  />
                )}
              
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