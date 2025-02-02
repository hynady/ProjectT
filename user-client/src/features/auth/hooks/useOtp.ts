import { useState, useEffect } from 'react';
import {OtpState} from "@/features/auth/internal-types/auth.ts";
import {useToast} from "@/commons/hooks/use-toast.ts";
import {authService} from "@/features/auth/services/auth.service.ts";


interface ApiError {
  status: number;
  message: string;
}

// Định nghĩa một map các error messages
const ERROR_MESSAGES: Record<string, Record<number, string>> = {
  register: {
    409: "Email này đã có tài khoản.",
    429: "Bạn đã gửi quá nhiều yêu cầu OTP. Vui lòng thử lại sau.",
  },
  reset: {
    404: "Email này chưa đăng ký tài khoản.",
    429: "Bạn đã gửi quá nhiều yêu cầu OTP. Vui lòng thử lại sau.",
  }
};

export const useOtp = (type: 'register' | 'reset') => {
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
    try {
      if (type === 'register') {
        await authService.sendRegisterOtp(email);
      } else {
        await authService.sendResetOtp(email);
      }
      
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
      console.log('Full error object:', error);
      console.log('Error response:', (error as any).response);
      const apiError = error as ApiError;
      console.log('API Error status:', apiError.status);
      
      // Adjust error handling based on axios error structure
      const status = apiError.status || (error as any)?.response?.status;
      console.log('Final status used:', status);
      
      const errorMessage = ERROR_MESSAGES[type][status] || "Lỗi gửi OTP, thử lại sau.";

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
      console.error('OTP verification failed:', error);
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