import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/commons/components/dialog.tsx';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/commons/components/form.tsx';
import { Input } from '@/commons/components/input.tsx';
import { Button } from '@/commons/components/button.tsx';
import { toast } from '@/commons/hooks/use-toast.ts';
import { ScrollArea } from '@/commons/components/scroll-area.tsx';
import { UserProfileCard, CreateProfileCardRequest, UpdateProfileCardRequest } from '../internal-types/settings.types';
import { settingsService } from '../services/settings.service';

const profileCardSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phoneNumber: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .regex(/^\d+$/, 'Số điện thoại chỉ được chứa các chữ số'),
  email: z.string().email('Email không hợp lệ')
});

type ProfileCardFormValues = z.infer<typeof profileCardSchema>;

interface ProfileCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  profileData?: UserProfileCard;
  onSuccess: () => void;
}

export function ProfileCardDialog({ 
  open, 
  onOpenChange, 
  mode, 
  profileData, 
  onSuccess 
}: ProfileCardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProfileCardFormValues>({
    resolver: zodResolver(profileCardSchema),
    defaultValues: {
      name: profileData?.name || '',
      phoneNumber: profileData?.phoneNumber || '',
      email: profileData?.email || ''
    },
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        name: profileData?.name || '',
        phoneNumber: profileData?.phoneNumber || '',
        email: profileData?.email || ''
      });
    }
  }, [open, form, profileData]);
  
  const handleSubmit = async (values: ProfileCardFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (mode === 'create') {
        const data: CreateProfileCardRequest = {
          name: values.name,
          phoneNumber: values.phoneNumber,
          email: values.email
        };
        
        await settingsService.createProfileCard(data);
        toast({
          title: 'Thành công',
          description: 'Thẻ thông tin đã được tạo'
        });
      } else if (mode === 'edit' && profileData) {
        const data: UpdateProfileCardRequest = {
          id: profileData.id,
          name: values.name,
          phoneNumber: values.phoneNumber,
          email: values.email
        };
        
        await settingsService.updateProfileCard(data);
        toast({
          title: 'Thành công',
          description: 'Thẻ thông tin đã được cập nhật'
        });
      }
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo thẻ thông tin mới' : 'Chỉnh sửa thẻ thông tin'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Thêm thông tin liên hệ cho thẻ thông tin mới của bạn.' 
              : 'Cập nhật thông tin cho thẻ thông tin của bạn.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="h-4" /> {/* Spacer for bottom padding */}
            </form>
          </Form>
        </ScrollArea>
        
        <DialogFooter className="pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
