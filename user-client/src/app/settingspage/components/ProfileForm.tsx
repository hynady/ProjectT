import { z } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { toast } from "@/hooks/use-toast.ts";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { DatePicker } from "@/components/ui/date-picker.tsx";
import { Popover } from "@radix-ui/react-popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { ChangeEvent, useState } from 'react';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username phải có ít nhất 2 ký tự.',
    })
    .max(30, {
      message: 'Username không được dài quá 30 ký tự.',
    }),
  email: z
    .string({
      required_error: 'Vui lòng nhập email.',
    })
    .email(),
  birthday: z.date({
    required_error: "Vui lòng chọn ngày sinh.",
  }),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  username: '',
  email: '',
  avatar: '',
};

export function ProfileForm() {
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { control, handleSubmit, setValue } = methods;

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setValue('avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: 'Bạn đã gửi các giá trị sau:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card Ảnh đại diện */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Ảnh đại diện</h3>
              <p className="text-sm text-muted-foreground">
                Chọn ảnh đại diện để hiển thị trên hồ sơ của bạn.
              </p>
            </div>
            <Separator/>

            <FormField
              control={control}
              name="avatar"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-40 h-40">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback>
                          {methods.getValues('username')?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          onChange={handleAvatarChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Chọn ảnh đại diện của bạn. Định dạng cho phép: JPG, PNG.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Card Thông tin cá nhân */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
              <p className="text-sm text-muted-foreground">
                Cập nhật thông tin cá nhân của bạn.
              </p>
            </div>
            <Separator/>

            <FormField
              control={control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Tên người dùng</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên người dùng" {...field} />
                  </FormControl>
                  <FormDescription>
                    Đây là tên hiển thị công khai của bạn.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@mail.com" type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email dùng để liên hệ và xác thực tài khoản.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Card Thông tin bổ sung */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Thông tin bổ sung</h3>
              <p className="text-sm text-muted-foreground">
                Cung cấp thêm thông tin chi tiết về bạn.
              </p>
            </div>
            <Separator/>

            <FormField
              control={control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày sinh</FormLabel>
                  <Popover>
                    <FormControl>
                      <DatePicker
                        selectedDate={field.value}
                        onDateChange={field.onChange}
                        startYear={1900}
                        endYear={new Date().getFullYear()}
                      />
                    </FormControl>
                  </Popover>
                  <FormDescription>
                    Ngày sinh của bạn sẽ được sử dụng để xác minh độ tuổi.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Cập nhật thông tin</Button>
        </div>
      </form>
    </FormProvider>
  );
}