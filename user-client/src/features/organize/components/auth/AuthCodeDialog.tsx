import { useCallback, useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/commons/components/dialog";
import { Button } from "@/commons/components/button";
import { Progress } from "@/commons/components/progress";
import { toast } from "@/commons/hooks/use-toast";
import { organizeService } from "../../services/organize.service";
import { AuthCodeResponse } from "../../internal-types/show-operations.type";

interface AuthCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showId: string;
  showName: string;
}

export const AuthCodeDialog = ({
  open,
  onOpenChange,
  showId,
  showName,
}: AuthCodeDialogProps) => {
  const [authData, setAuthData] = useState<AuthCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const fetchAuthCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await organizeService.getAuthCode(showId);
      setAuthData(data);
    } catch (err) {
      console.error("Error fetching auth code:", err);
      setError("Không thể lấy mã xác thực. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [showId]);
  
  // Fetch the auth code when the dialog opens
  useEffect(() => {
    if (open && showId) {
      fetchAuthCode();
    }
  }, [open, showId, fetchAuthCode]);

  // Update the countdown timer
  useEffect(() => {
    if (!authData || !open) return;

    const expiresAt = new Date(authData.expiresAt);
    const now = new Date();
    const totalDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
    const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
    
    setRemainingTime(remaining);
    setProgress(Math.max(0, (remaining / totalDuration) * 100));

    const timer = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
      
      setRemainingTime(remaining);
      setProgress(Math.max(0, (remaining / totalDuration) * 100));
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [authData, open]);
  
  const handleRefreshCode = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const data = await organizeService.refreshAuthCode(showId);
      setAuthData(data);
      toast({
        title: "Thành công",
        description: "Đã làm mới mã xác thực",
      });
    } catch (err) {
      console.error("Error refreshing auth code:", err);
      setError("Không thể làm mới mã xác thực. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyCode = () => {
    if (!authData) return;
    
    navigator.clipboard.writeText(authData.authCode);
    toast({
      title: "Đã sao chép",
      description: "Mã xác thực đã được sao chép vào clipboard",
    });
  };

  // Format remaining time as mm:ss
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mã xác thực rút gọn</DialogTitle>
          <DialogDescription>
            Mã xác thực cho suất diễn {showName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAuthCode}>Thử lại</Button>
          </div>
        ) : authData ? (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-bold tracking-wider bg-muted px-6 py-4 rounded-md w-full text-center">
                {authData.authCode}
              </div>
              
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Thời gian còn lại:</span>
                  <span className={remainingTime < 30000 ? "text-destructive font-medium" : ""}>
                    {formatTime(remainingTime)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4" />
                <span>Sao chép</span>
              </Button>
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={handleRefreshCode}
                disabled={refreshing}
                loading={refreshing}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Làm mới</span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Mã xác thực có hiệu lực trong 60 phút. Bạn có thể làm mới mã bất kỳ lúc nào.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
