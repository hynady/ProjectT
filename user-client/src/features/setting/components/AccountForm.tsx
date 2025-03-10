import { z } from 'zod';
import { Button } from '@/commons/components/button.tsx';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/commons/components/form.tsx';
import { Input } from '@/commons/components/input.tsx';
import { toast } from "@/commons/hooks/use-toast.ts";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/commons/components/date-picker.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/commons/components/avatar.tsx";
import { ChangeEvent, useEffect, useState } from 'react';
import { Popover } from "@/commons/components/popover.tsx";
import { UserInfo, UpdateProfileRequest } from "../internal-types/settings.types";
import { settingsService } from "../services/settings.service";
import { uploadImageToCloudinary, getAvatarUrl } from "@/utils/cloudinary.utils";
import { Loader2 } from "lucide-react";

const accountFormSchema = z.object({
  name: z
    .string({
      required_error: 'Vui lòng nhập tên người dùng.',
      invalid_type_error: 'Vui lòng nhập tên người dùng.',
    })
    .min(2, {
      message: 'Tên phải có ít nhất 2 ký tự.',
    })
    .max(30, {
      message: 'Tên không được dài quá 30 ký tự.',
    }),
  email: z
    .string({
      required_error: 'Vui lòng nhập email.',
    })
    .email(),
 birthday: z.preprocess(
    (val) => {
      // Chuyển đổi chuỗi thành Date
      if (typeof val === 'string') return new Date(val);
      // Giữ nguyên giá trị Date hoặc null
      return val;
    },
    z.date().nullable().optional()
  ),
  avatar: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  initialData?: UserInfo;
  isLoading?: boolean;
}

export function AccountForm({ initialData, isLoading = false }: AccountFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const methods = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      avatar: initialData?.avatar || '',
      birthday: initialData?.birthday 
        ? typeof initialData.birthday === 'string' 
          ? new Date(initialData.birthday) 
          : initialData.birthday 
        : null,
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, setValue, reset } = methods;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        avatar: initialData.avatar || '',
        birthday: initialData.birthday 
          ? typeof initialData.birthday === 'string' 
            ? new Date(initialData.birthday) 
            : initialData.birthday 
          : null,
      });
      
      if (initialData.avatar) {
        setAvatarPreview(initialData.avatar);
      } else {
        setAvatarPreview(getAvatarUrl(initialData.name));
      }
    }
  }, [initialData, reset]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatarToCloudinary = async (): Promise<string | undefined> => {
    if (!selectedFile) return undefined;
    
    try {
      setIsUploadingImage(true);
      const result = await uploadImageToCloudinary(selectedFile, 'user_avatars');
      
      // You can now access additional metadata from result
      console.log(`Image uploaded: ${result.public_id} (${result.width}x${result.height}px, ${Math.round(result.bytes / 1024)} KB)`);
      
      return result.secure_url;
    } catch (error) {
      toast({
        title: "Lỗi tải ảnh",
        description: error instanceof Error ? error.message : "Không thể tải ảnh lên, vui lòng thử lại.",
        variant: "destructive",
      });
      return undefined;
    } finally {
      setIsUploadingImage(false);
    }
  };

  async function onSubmit(data: AccountFormValues) {
    try {
      setIsSubmitting(true);
      
      // Upload image to Cloudinary if there's a new file selected
      let avatarUrl = data.avatar;
      if (selectedFile) {
        avatarUrl = await uploadAvatarToCloudinary();
        if (!avatarUrl) {
          setIsSubmitting(false);
          return; // Exit if upload failed
        }
      }
      
      const profileData: UpdateProfileRequest = {
        name: data.name,
        birthday: data.birthday,
        avatar: avatarUrl,
      };
      
      const result = await settingsService.updateInfo(profileData);
      
      // Update the form with new avatar URL from Cloudinary
      if (avatarUrl && avatarUrl !== data.avatar) {
        setValue('avatar', avatarUrl);
      }
      
      // Clear selected file after successful update
      setSelectedFile(null);
      
      toast({
        title: "Thành công!",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra khi cập nhật thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card Ảnh đại diện */}
        <div className="space-y-6">
          <FormField
            control={control}
            name="avatar"
            render={() => (
              <FormItem>
                <FormLabel className="text-base">Ảnh đại diện</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-24 h-24">
                      {isUploadingImage ? (
                        <div className="flex items-center justify-center w-full h-full bg-muted">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          <AvatarImage src={avatarPreview} />
                          <AvatarFallback>
                            {methods.getValues('name')?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full"
                      />
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Chọn ảnh đại diện của bạn. Định dạng cho phép: JPG, PNG, GIF.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Thông tin cá nhân */}
        <div className="space-y-6">
          <FormField
            control={control}
            name="name"
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
                  <Input 
                    placeholder="example@mail.com" 
                    type="email" 
                    {...field} 
                    disabled 
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
                <FormDescription>
                  Email dùng để liên hệ và xác thực tài khoản. Không thể thay đổi email.
                </FormDescription>
                <FormMessage/>
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="birthday"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày sinh</FormLabel>
                {field.value ? (
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
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm text-muted-foreground">Ngày sinh chưa được đặt</div>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setValue('birthday', new Date())}
                    >
                      Thiết lập ngày sinh
                    </Button>
                  </div>
                )}
                <FormDescription>
                  Ngày sinh của bạn sẽ được sử dụng để xác minh độ tuổi.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploadingImage}
          >
            {(isSubmitting || isUploadingImage) ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
