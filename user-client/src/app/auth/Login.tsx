import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  FormFixColorLabel,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form-fix-color-label.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {mockAuthService as authService} from "@/services/mockAuthService.tsx";
import {toast} from "@/hooks/use-toast.ts";
import {useAppContext} from "@/components/AppContext.tsx";
import {useNavigate} from "react-router-dom";


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
  const {setAuthenticated} = useAppContext();
  const navigate = useNavigate();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Gọi authService để đăng nhập
      const response = await authService.login(data);
      console.log("Đăng nhập thành công:", response);
      // Hiển thị thông báo đăng nhập thành công
      toast({
        title: "Đăng nhập thành công!",
        variant: "success",
      });
      // Nếu đăng nhập thành công, cập nhật trạng thái và điều hướng
      setAuthenticated(true);
      navigate('/');
    } catch (error: any) {
      // Kiểm tra nếu là lỗi 403
      if (error.status === 403) {
        toast({
          title: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
          variant: "destructive",
        });
      } else {
        // Xử lý các lỗi khác (ví dụ lỗi mạng, lỗi server)
        toast({
          title: "Có lỗi khi đăng nhập, thử lại sau!",
          variant: "destructive",
        });
      }

      // Log lỗi ra console để debug
      console.error("Lỗi đăng nhập:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md p-6 rounded-md shadow-md">
        <CardHeader>
          <CardTitle className="font-bold">Đăng nhập</CardTitle>
          <CardDescription>Nhập email và mật khẩu để đăng nhập</CardDescription>
        </CardHeader>
        <CardContent>
          <FormFixColorLabel {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <a
                        href="/rs-pw"
                        className="text-sm text-primary hover:underline"
                      >
                        Quên mật khẩu?
                      </a>
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
              <Button className="w-full" type="submit" disabled={!form.formState.isValid}>
                Đăng nhập
              </Button>
            </form>
          </FormFixColorLabel>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Label>
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-primary hover:underline">
              Đăng ký
            </a>
          </Label>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;