import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/commons/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/commons/components/form";
import { Input } from "@/commons/components/input";
import { Textarea } from "@/commons/components/textarea";
import { ArrowRight, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { BasicInfoFormData } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";

// Extend the schema to include bannerFile
const basicInfoSchema = z.object({
  title: z.string().min(5, {
    message: "Tên sự kiện phải có ít nhất 5 ký tự",
  }),
  artist: z.string().min(2, {
    message: "Tên nghệ sĩ phải có ít nhất 2 ký tự",
  }),
  location: z.string().min(3, {
    message: "Địa điểm phải có ít nhất 3 ký tự",
  }),
  address: z.string().min(5, {
    message: "Địa chỉ phải có ít nhất 5 ký tự",
  }),
  duration: z.coerce.number().min(15, {
    message: "Thời lượng phải ít nhất 15 phút",
  }).max(600, {
    message: "Thời lượng không quá 600 phút (10 giờ)"
  }),
  description: z.string().min(10, {
    message: "Mô tả phải có ít nhất 10 ký tự",
  }),
  bannerUrl: z.string().optional(),
  bannerFile: z.any().optional(), // Add this to the schema
});

// Create a type that matches the schema
type FormValues = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  data: BasicInfoFormData;
  onChange: (data: BasicInfoFormData) => void;
  onNext: () => void;
}

export const BasicInfoForm = ({ data, onChange, onNext }: BasicInfoFormProps) => {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      artist: "",
      location: "",
      address: "",
      duration: 120,
      description: "",
      bannerUrl: "",
    },
  });

  useEffect(() => {
    if (data) {
      Object.keys(data).forEach((key) => {
        const typedKey = key as keyof BasicInfoFormData;
        form.setValue(typedKey as any, data[typedKey]);
      });
      
      if (typeof data.bannerUrl === 'string' && data.bannerUrl) {
        setBannerPreview(data.bannerUrl);
      }
    }
  }, [data, form]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Lưu file để submit sau
    setBannerFile(file);
    
    // Chỉ hiển thị preview mà không upload
    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);
    
    // Lưu File object vào form
    form.setValue("bannerFile", file);
    
    toast({
      title: "Đã chọn ảnh",
      description: "Ảnh sẽ được tải lên khi bạn lưu hoặc đăng sự kiện",
    });
  };

  const onSubmit = (values: FormValues) => {
    // Explicitly create a BasicInfoFormData object
    const submitData: BasicInfoFormData = {
      ...values,
      bannerUrl: bannerPreview || "",
      bannerFile: bannerFile || undefined,
    };
    
    onChange(submitData);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sự kiện</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập tên sự kiện" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nghệ sĩ / Người trình bày</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Tên nghệ sĩ hoặc người trình bày" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa điểm tổ chức</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Tên địa điểm (VD: Nhà hát Hòa Bình)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ cụ thể</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Địa chỉ đầy đủ của địa điểm" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng (phút)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="120" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả sự kiện</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Mô tả chi tiết về sự kiện (hỗ trợ định dạng Markdown)" 
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Ảnh banner sự kiện</FormLabel>
          <div className="flex items-center gap-4">
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center w-full h-60 relative overflow-hidden"
              onClick={() => document.getElementById('banner-upload')?.click()}
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nhấn để tải lên ảnh banner
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG (Tỉ lệ khuyến nghị: 16:9)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            Tiếp theo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};
