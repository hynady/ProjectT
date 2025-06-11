import { useState } from "react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from "@/commons/hooks/use-toast";
import { useAuth } from "@/features/auth/contexts";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/features/auth/services/auth.service";
import { useTheme } from "@/commons/blocks/theme-provider";
import { cn } from "@/commons/lib/utils/utils";

// Google logo SVG component
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleLoginButton = ({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error("Không nhận được thông tin xác thực từ Google");
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
        throw new Error("Không nhận được token từ server");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Đăng nhập Google thất bại";
      
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    const errorMessage = "Đăng nhập Google bị hủy hoặc có lỗi xảy ra";
    
    toast({
      title: "Đăng nhập thất bại",
      description: errorMessage,
      variant: "destructive",
    });
    
    onError?.(errorMessage);
    setIsLoading(false);
  };  return (
    <div className="relative transition-all duration-300 ease-in-out active:scale-95">
      {/* Custom Button Overlay - Using shadcn button secondary variant styling */}
      <div className={cn(
        // Base button styles from shadcn
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ",
        // Secondary variant styles
        "bg-secondary shadow text-secondary-foreground hover:bg-secondary/80",
        // Size lg
        "h-10 rounded-md px-8",
        // Custom width
        "w-full",
        "cursor-pointer",
        isLoading && "pointer-events-none opacity-50"
      )}>
        {!isLoading && <GoogleIcon />}
        <span className="text-sm font-medium">
          {isLoading ? "Đang xử lý..." : "Tham gia với Google"}
        </span>
      </div>
      
      {/* Hidden Google Login Button */}
      <div className="absolute inset-0 opacity-0">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          size="large"
          width="100%"
          theme={theme === "dark" ? "filled_black" : "outline"}
        />
      </div>
    </div>
  );
};
