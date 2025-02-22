import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Button} from "@/commons/components/button.tsx";
import {Input} from "@/commons/components/input.tsx";
import {Label} from "@/commons/components/label.tsx";
import {
  FormFixColorLabel,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/commons/components/form-fix-color-label.tsx";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/commons/components/card.tsx";
import {toast} from "@/commons/hooks/use-toast.ts";
import {useNavigate, useLocation} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "@/features/auth/contexts.tsx";
import {authService} from "@/features/auth/services/auth.service.ts";

// Define form validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập email hợp lệ.",
  }),
  password: z.string().min(8, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
});

// Define form data type
type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: FormValues) => {
    try {
      setLoading(true);
      const response = await authService.login(data);

      // Add debug logs
      // console.log("Full API response:", response) ;

      if (!response || !response.token) {
        throw new Error("Token không hợp lệ từ server");
      }

      // If we get here, we have a valid token
      login(response.token);

      toast({
        title: "Đăng nhập thành công!",
        variant: "success",
      });

      // Sau khi đăng nhập thành công
      // Lấy đường dẫn trước đó từ state, nếu không có thì về homepage
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
      
    } catch (error: any) {
      // console.error("Login error:", error);
      toast({
        title: error.status === 403
          ? "Email hoặc mật khẩu không đúng. Vui lòng thử lại."
          : "Có lỗi khi đăng nhập, thử lại sau!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <CardHeader>
        <CardTitle className="font-bold">Đăng nhập</CardTitle>
        <CardDescription>Nhập email và mật khẩu để đăng nhập</CardDescription>
      </CardHeader>
      <CardContent>
        <FormFixColorLabel {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập email" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mật khẩu</FormLabel>
                    <span
                      onClick={() => navigate('/rs-pw')}
                      className="text-sm text-primary hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={!form.formState.isValid} loading={loading}>
              Đăng nhập
            </Button>
          </form>
        </FormFixColorLabel>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Label>
          Chưa có tài khoản?{" "}
          <a className="text-primary hover:underline cursor-pointer"
             onClick={() => navigate('/register')}
          >
            Đăng ký
          </a>
        </Label>
      </CardFooter>
    </>
  );
};

export default LoginPage;