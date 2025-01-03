import {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {InputOTP, InputOTPGroup, InputOTPSlot,} from "@/components/ui/input-otp.tsx"
// import { authService } from "@/services/authService";
import {mockAuthService as authService} from "@/services/mockAuthService.tsx";
import {useToast} from "@/hooks/use-toast.ts"
import {CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Progress} from "@/components/ui-custom/progress-check-strength.tsx"
import {cn} from "@/lib/utils.ts";
import {checkPasswordStrength} from "@/utils/password.tsx";
import {useNavigate} from "react-router-dom";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("step1");
  const [loading, setLoading] = useState(false); // Trạng thái loading khi gửi OTP
  const [strength, setStrength] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {toast} = useToast()
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true); // Bắt đầu quá trình gửi OTP
    try {
      await authService.sendOtp(email);
      toast({
        title: "OTP đã được gửi đến email của bạn!",
      });
      setActiveTab("step2"); // Chuyển sang bước 2

      // Kích hoạt trạng thái chờ và đặt thời gian cooldown
      setResendDisabled(true);
      setCooldown(30);
    } catch (error: any) {
      if (error.status === 409) {
        toast({
          variant: "destructive",
          title: error.message // Hiển thị "Email này đã có tài khoản."
        });
      } else if (error.response?.status === 429) { // HTTP 429: Too Many Requests
        toast({
          variant: "destructive",
          title: "Bạn đã gửi quá nhiều yêu cầu OTP. Vui lòng thử lại sau.",
        });
      } else {
        toast({
          variant: "destructive",
          title: error.message || "Lỗi gửi OTP, thử lại sau.",
        });
      }
    } finally {
      setLoading(false); // Kết thúc quá trình gửi OTP
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true); // Bắt đầu quá trình xác thực OTP
    try {
      await authService.verifyOtp(email, otp);
      toast({
        title: "OTP hợp lệ!",
      })
      setActiveTab("step3"); // Chuyển sang bước 3
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi xác thực OTP, nhập lại hoặc gửi lại mã khác!"
      });
    } finally {
      setLoading(false); // Kết thúc quá trình xác thực OTP
    }
  };

  const handleRegister = async () => {
    setLoading(true); // Bắt đầu quá trình đăng ký
    try {
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Mật khẩu không khớp!"
        });
        return;
      }
      await authService.register({email, password});
      toast({
        variant: "success",
        title: "Đăng ký thành công!"
      });
      setTimeout(() => {
        window.location.href = "/login"; // Chuyển hướng sang trang đăng nhập
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng ký, thử lại sau!"
      });
    } finally {
      setLoading(false); // Kết thúc quá trình đăng ký
    }
  };

  useEffect(() => {
    const {score} = checkPasswordStrength(password);
    setStrength(score);
  }, [password]);

  useEffect(() => {
    if (resendDisabled && cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);

      return () => clearTimeout(timer); // Xóa timer khi component unmount
    }

    if (cooldown === 0) {
      setResendDisabled(false);
    }
  }, [cooldown, resendDisabled]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-bold">Đăng ký</CardTitle>
        <CardDescription>Nhập các thông tin của bạn để tiến hành đăng ký</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab}>
          <TabsList className="flex justify-between mb-4">
            <TabsTrigger
              value="step1"
              onClick={() => {
                setActiveTab("step1");
                setOtp(""); // Xóa trạng thái OTP khi quay lại bước 1
                setPassword(""); // Xóa trạng thái Password khi quay lại bước 1
                setConfirmPassword("");
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

          {/* Bước 1: Nhập Email */}
          <TabsContent value="step1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp();
              }}
            >
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" loading={loading} disabled={email.length < 1}>
                  Gửi OTP
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Bước 2: Nhập OTP */}
          <TabsContent value="step2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
            >
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center">
                    <Label htmlFor="otp">Nhập mã OTP</Label>
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      className="ml-auto text-sm"
                      variant="link"
                      disabled={resendDisabled} // Vô hiệu hóa khi đang trong trạng thái chờ
                    >
                      {resendDisabled ? `Gửi lại mã trong (${cooldown}s)` : "Gửi lại mã"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <InputOTP
                      pattern={REGEXP_ONLY_DIGITS}
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0}/>
                        <InputOTPSlot index={1}/>
                        <InputOTPSlot index={2}/>
                        <InputOTPSlot index={3}/>
                        <InputOTPSlot index={4}/>
                        <InputOTPSlot index={5}/>
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={otp.length < 6} loading={loading}>
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
                handleRegister();
              }}
            >
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password && (
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
                            const {criteria} = checkPasswordStrength(password);
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
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  loading={loading}
                  disabled={confirmPassword.length < 1 || password.length < 1 || strength < 80}
                >
                  Đăng ký
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Label>
          Đã có tài khoản?{" "}
          <a onClick={() => navigate('/login')}
             className="text-primary hover:underline cursor-pointer">Đăng
            nhập</a>
        </Label>
      </CardFooter>
    </>
  );
};

export default RegisterPage;
