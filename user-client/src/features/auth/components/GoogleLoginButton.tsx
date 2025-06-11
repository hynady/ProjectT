import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from '@/commons/hooks/use-toast';
import { useAuth } from '@/features/auth/contexts';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/services/auth.service';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleLoginButton = ({ 
  onSuccess, 
  onError
}: GoogleLoginButtonProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('Không nhận được thông tin xác thực từ Google');
      }

      // Send Google credential to backend
      const response = await authService.googleLogin(credentialResponse.credential);
      
      if (response.token) {
        // Login successful
        await login(response.token);
        
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đến với Tack Ticket!",
        });

        // Navigate to intended page or dashboard
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
        
        onSuccess?.();
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Đăng nhập Google thất bại';
      
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    }
  };

  const handleGoogleError = () => {
    const errorMessage = 'Đăng nhập Google bị hủy hoặc có lỗi xảy ra';
    
    toast({
      title: "Đăng nhập thất bại",
      description: errorMessage,
      variant: "destructive",
    });
    
    onError?.(errorMessage);
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        shape="rectangular"
        width="100%"
        text="signin_with"
        locale="vi"
      />
    </div>
  );
};
