import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/commons/components/dialog.tsx";
import { Button } from "@/commons/components/button.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/commons/components/form.tsx";
import { Input } from "@/commons/components/input.tsx";
import { toast } from "@/commons/hooks/use-toast.ts";
import { settingsService } from "../services/settings.service";

const deleteAccountSchema = z.object({
  password: z.string().min(1, {
    message: "Mật khẩu không được để trống.",
  }),
  confirmation: z.string().refine(val => val === "" || val === "DELETE", {
    message: 'Vui lòng nhập "DELETE" để xác nhận',
  }),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  const onSubmit = async (data: DeleteAccountFormValues) => {
    try {
      setIsSubmitting(true);
      await settingsService.deleteAccount({
        password: data.password,
      });

      toast({
        title: "Tài khoản đã xóa",
        description: "Tài khoản của bạn đã được xóa thành công.",
      });
      
      // Đăng xuất và chuyển người dùng về trang chủ
      // Trong ứng dụng thực tế, gọi hàm logout từ AuthService
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error 
          ? error.message 
          : "Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Xóa tài khoản</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Xóa tài khoản</DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và không thể khôi phục.
            Vui lòng xác nhận rằng bạn muốn tiếp tục.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Nhập mật khẩu của bạn" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Xác nhận xóa tài khoản bằng cách nhập "DELETE"
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="DELETE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                variant="destructive" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận xóa tài khoản"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
