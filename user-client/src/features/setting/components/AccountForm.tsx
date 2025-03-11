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
import { uploadImageToCloudinary, getAvatarUrl as getNameAvatarUrl } from "@/utils/cloudinary.utils";
import { Loader2, Pencil, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/commons/components/dialog.tsx";
import { useUser } from '@/features/auth/contexts/UserContext';

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

// Base URL for avatar images
const AVATAR_BASE_URL = "https://www.rophim.tv/images/avatars/pack1/";
// Number of available avatars
const AVATAR_COUNT = 15;

export function AccountForm({ initialData, isLoading = false }: AccountFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const { refreshUserData } = useUser(); // Get the refresh function from useUser hook

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
      } else if (initialData.name) {
        setAvatarPreview(getNameAvatarUrl(initialData.name));
      } else {
        // Default fallback when both avatar and name are missing
        setAvatarPreview(getNameAvatarUrl('U'));
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
      setIsAvatarDialogOpen(false); // Close dialog after selection
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

  const handleSelectPredefinedAvatar = (avatarUrl: string) => {
    setAvatarPreview(avatarUrl);
    setValue('avatar', avatarUrl);
    setSelectedFile(null);
    setIsAvatarDialogOpen(false);
  };

  // Generate numbered avatar URLs
  const getNumberedAvatarUrl = (index: number): string => {
    // Ensure the index is padded with a leading zero if it's a single digit
    const paddedIndex = String(index).padStart(2, '0'); 
    return `${AVATAR_BASE_URL}${paddedIndex}.jpg`;
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
      
      // Refresh user data to update the navbar
      await refreshUserData();
      
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
        {/* Avatar section */}
        <div className="space-y-6">
          <FormField
            control={control}
            name="avatar"
            render={() => (
              <FormItem>
                <FormLabel className="text-base">Ảnh đại diện</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group">
                          <Avatar className="w-24 h-24">
                            {isUploadingImage ? (
                              <div className="flex items-center justify-center w-full h-full bg-muted">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            ) : avatarPreview ? (
                              <>
                                <AvatarImage src={avatarPreview} />
                                <AvatarFallback>
                                  {methods.getValues('name')?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </>
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-muted">
                                <Pencil className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </Avatar>
                          <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Pencil className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Chọn avatar</DialogTitle>
                          <DialogDescription>
                            Chọn một avatar có sẵn hoặc tải lên avatar của riêng bạn.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-4 gap-4 py-4">
                          {/* Upload option */}
                          <div className="relative">
                            <div className="aspect-square rounded-full border border-dashed border-muted-foreground flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="Tải ảnh lên"
                              />
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Predefined avatars using a loop - removed titles */}
                          {Array.from({ length: AVATAR_COUNT }, (_, index) => (
                            <div 
                              key={index} 
                              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                              onClick={() => handleSelectPredefinedAvatar(getNumberedAvatarUrl(index + 1))}
                            >
                              <img 
                                src={getNumberedAvatarUrl(index + 1)} 
                                alt={`Avatar option ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  e.currentTarget.src = `https://ui-avatars.com/api/?background=random&color=fff&name=${index + 1}&size=256`;
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {avatarPreview ? 'Nhấn vào avatar để thay đổi' : 'Nhấn vào để thiết lập avatar'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bạn có thể chọn avatar có sẵn hoặc tải lên ảnh của riêng bạn
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-primary mt-1">
                          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Ảnh đại diện sẽ hiển thị khi bạn đăng nhập và trong các hoạt động trên hệ thống.
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
