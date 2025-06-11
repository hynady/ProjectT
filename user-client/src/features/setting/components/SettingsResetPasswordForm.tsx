import { useState, useEffect } from "react";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import { Label } from "@/commons/components/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/commons/components/input-otp";
import { authService } from "@/features/auth/services/auth.service";
import { useToast } from "@/commons/hooks/use-toast";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Alert, AlertDescription } from "@/commons/components/alert";
import { Progress } from "@/commons/components/progress-check-strength";
import { cn } from "@/commons/lib/utils/utils";
import { useOtp } from "@/features/auth/hooks/useOtp";
import { checkPasswordStrength } from "@/commons/lib/utils/password";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";

interface SettingsResetPasswordFormProps {
  userEmail: string;
}

interface FormData {
  otp: string;
  password: string;
  confirmPassword: string;
}

const SettingsResetPasswordForm = ({ userEmail }: SettingsResetPasswordFormProps) => {  const [formData, setFormData] = useState<FormData>({
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("step1");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const { toast } = useToast();
  const { otpState, sendOtp, verifyOtp } = useOtp('reset');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOtp = async () => {
    const success = await sendOtp(userEmail);
    if (success) {
      setActiveTab("step2");
    }
  };

  const handleVerifyOtp = async () => {
    const success = await verifyOtp(userEmail, formData.otp);
    if (success) {
      setActiveTab("step3");
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mật khẩu không khớp!"
      });
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: userEmail,
        password: formData.password
      });

      toast({
        variant: "success",
        title: "Thay đổi mật khẩu thành công!"
      });      // Reset form
      setFormData({
        otp: "",
        password: "",
        confirmPassword: "",
      });
      setActiveTab("step1");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      toast({
        variant: "destructive",
        title: `Lỗi thay đổi mật khẩu: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { score } = checkPasswordStrength(formData.password);
    setStrength(score);
  }, [formData.password]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab}>
        <TabsList className="flex justify-between mb-4">
          <TabsTrigger
            value="step1"
            onClick={() => {
              setActiveTab("step1");
              setFormData(prev => ({
                ...prev,
                otp: "",
                password: "",
                confirmPassword: ""
              }));
            }}>
            Bước 1
          </TabsTrigger>
          <TabsTrigger value="step2" disabled>
            Bước 2
          </TabsTrigger>
          <TabsTrigger value="step3" disabled>
            Bước 3
          </TabsTrigger>
        </TabsList>

        {/* Bước 1: Xác nhận Email */}
        <TabsContent value="step1">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendOtp();
          }}>            
          <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-3">                <div className="text-start">
                  <p className="text-sm text-muted-foreground">
                    Mã OTP sẽ được gửi đến email: <span className="font-medium text-foreground">{userEmail}</span>
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                type="submit"
                loading={otpState.isLoading}
              >
                Gửi OTP
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Bước 2: Nhập OTP */}
        <TabsContent value="step2">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleVerifyOtp();
          }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="otp">Nhập mã OTP</Label>
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    className="ml-auto text-sm"
                    variant="link"
                    disabled={otpState.isDisabled}
                  >                    {otpState.isDisabled
                      ? `Gửi lại mã trong (${otpState.cooldown}s)`
                      : "Gửi lại mã"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <InputOTP
                    pattern={REGEXP_ONLY_DIGITS}
                    maxLength={6}
                    value={formData.otp}
                    onChange={(value) => setFormData(prev => ({ ...prev, otp: value }))}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={formData.otp.length < 6}
                loading={otpState.isLoading}
              >
                Xác nhận OTP
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Bước 3: Nhập Mật khẩu */}
        <TabsContent value="step3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                {formData.password && (
                  <>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">
                          Độ mạnh: {
                            strength === 0 ? "Rất yếu" :
                              strength <= 20 ? "Yếu" :
                                strength <= 40 ? "Trung bình" :
                                  strength <= 60 ? "Khá" :
                                    strength <= 80 ? "Mạnh" : "Rất mạnh"
                          }
                        </span>
                        <span className="text-sm">{strength}%</span>
                      </div>
                      <Progress
                        value={strength}
                      />
                    </div>
                    <Alert className="mt-2">
                      <AlertDescription>
                        {(() => {
                          const { criteria } = checkPasswordStrength(formData.password);
                          return (
                            <ul className="text-sm list-disc pl-4 space-y-1">
                              <li className={cn(
                                criteria.length
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-destructive dark:text-destructive-foreground"
                              )}>
                                Ít nhất 8 ký tự
                              </li>
                              <li className={cn(
                                criteria.hasNumber
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-destructive dark:text-destructive-foreground"
                              )}>
                                Ít nhất 1 số
                              </li>
                              <li className={cn(
                                criteria.hasLower
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-destructive dark:text-destructive-foreground"
                              )}>
                                Ít nhất 1 chữ thường
                              </li>
                              <li className={cn(
                                criteria.hasUpper
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-destructive dark:text-destructive-foreground"
                              )}>
                                Ít nhất 1 chữ hoa
                              </li>
                              <li className={cn(
                                criteria.hasSpecial
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-destructive dark:text-destructive-foreground"
                              )}>
                                Ít nhất 1 ký tự đặc biệt
                              </li>
                            </ul>
                          );
                        })()}
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                loading={loading}
                disabled={
                  formData.confirmPassword.length < 1 ||
                  formData.password.length < 1 ||
                  strength < 80
                }
              >
                Lưu mật khẩu mới
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsResetPasswordForm;
