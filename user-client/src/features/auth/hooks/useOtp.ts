import { useState, useEffect } from 'react';
import {OtpState} from "@/features/auth/internal-types/auth.ts";
import {useToast} from "@/commons/hooks/use-toast.ts";
import {authService} from "@/features/auth/services/auth.service.ts";


interface ApiError {
  status: number;
  message: string;
}

// Định nghĩa một map các error messages
const ERROR_MESSAGES: Record<number, string> = {
  409: "Email này đã có tài khoản.",
  429: "Bạn đã gửi quá nhiều yêu cầu OTP. Vui lòng thử lại sau.",
};

export const useOtp = () => {
  const [otpState, setOtpState] = useState<OtpState>({
    isLoading: false,
    cooldown: 0,
    isDisabled: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpState.isDisabled && otpState.cooldown > 0) {
      timer = setTimeout(() => {
        setOtpState(prev => ({
          ...prev,
          cooldown: prev.cooldown - 1,
        }));
      }, 1000);
    }

    if (otpState.cooldown === 0) {
      setOtpState(prev => ({
        ...prev,
        isDisabled: false,
      }));
    }

    return () => clearTimeout(timer);
  }, [otpState.cooldown, otpState.isDisabled]);

  const sendOtp = async (email: string) => {
    setOtpState(prev => ({ ...prev, isLoading: true }));
    console.log("email", email);
    try {
      await authService.sendOtp(email);
      toast({
        title: "OTP đã được gửi đến email của bạn!",
      });
      setOtpState(prev => ({
        ...prev,
        isDisabled: true,
        cooldown: 30,
      }));
      return true;
    } catch (error) {
      // Type guard để kiểm tra error
      const apiError = error as ApiError;
      const errorMessage = ERROR_MESSAGES[apiError.status] || "Lỗi gửi OTP, thử lại sau.";

      toast({
        variant: "destructive",
        title: errorMessage,
      });
      return false;
    } finally {
      setOtpState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setOtpState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.verifyOtp(email, otp);
      toast({
        title: "OTP hợp lệ!",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi xác thực OTP, nhập lại hoặc gửi lại mã khác!"
      });
      return false;
    } finally {
      setOtpState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    otpState,
    sendOtp,
    verifyOtp,
  };
};