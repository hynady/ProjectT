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
import { ArrowRight, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { BasicInfoFormData } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";
import { RichTextEditor } from "@/commons/components/rich-text-editor";

// Define the schema with proper types
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
  }).transform(val => {
    try {
      JSON.parse(val);
      return val;
    } catch {
      // If not valid JSON, wrap it in a paragraph structure
      return JSON.stringify([
        {
          type: 'paragraph',
          children: [{ text: val }],
        },
      ]);
    }
  }),
  bannerUrl: z.string().optional(),
  // Use a custom Zod type for File objects
  bannerFile: z.instanceof(File, { message: "Vui lòng chọn một tệp hợp lệ" }).optional(),
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
    // Khởi tạo với data nếu có, nếu không thì dùng giá trị mặc định
    defaultValues: {
      title: data?.title || "",
      artist: data?.artist || "",
      location: data?.location || "",
      address: data?.address || "",
      duration: data?.duration || 120,
      description: data?.description || JSON.stringify([
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]),
      bannerUrl: data?.bannerUrl || "",
    },
  });

  // Effect này sẽ chạy khi data thay đổi và form đã được khởi tạo
  useEffect(() => {
    if (data) {
      // Sử dụng reset thay vì setValue để cập nhật toàn bộ form
      form.reset({
        title: data.title || "",
        artist: data.artist || "",
        location: data.location || "",
        address: data.address || "",
        duration: data.duration || 120,
        description: data.description || JSON.stringify([
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ]),
        bannerUrl: data.bannerUrl || "",
      });

      if (data.bannerUrl) {
        setBannerPreview(data.bannerUrl);
      }
      if (data.bannerFile) {
        setBannerFile(data.bannerFile);
      }
    }
  }, [data]);

  // REMOVE THE PROBLEMATIC WATCH EFFECT THAT CAUSES TYPING ISSUES
  // Instead, only update on blur or submit

  // Handle blur events to update the parent form
  const handleFieldBlur = () => {
    const values = form.getValues();
    const currentData: BasicInfoFormData = {
      title: values.title || "",
      artist: values.artist || "",
      location: values.location || "",
      address: values.address || "",
      duration: values.duration || 120,
      description: values.description || "",
      bannerUrl: bannerPreview || "",
      bannerFile: bannerFile || undefined,
    };
    
    onChange(currentData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Revoke the previous blob URL if it exists
    if (bannerPreview && bannerPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview);
    }

    // Lưu file để submit sau
    setBannerFile(file);
    
    // Chỉ hiển thị preview mà không upload
    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);
    
    // Lưu File object vào form
    form.setValue("bannerFile", file);
    
    // Update parent on file change
    handleFieldBlur();
    
    toast({
      title: "Đã chọn ảnh",
      description: "Ảnh sẽ được tải lên khi bạn lưu hoặc đăng sự kiện",
    });
    
    // Reset the input value to allow selecting the same file again if needed
    event.target.value = '';
  };

  const handleRemoveBanner = () => {
    // Revoke the blob URL if it exists
    if (bannerPreview && bannerPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview);
    }
    
    // Clear the banner preview and file
    setBannerPreview(null);
    setBannerFile(null);
    form.setValue("bannerFile", undefined);
    form.setValue("bannerUrl", "");
    
    // Update parent component
    handleFieldBlur();
    
    toast({
      title: "Đã xóa ảnh",
      description: "Ảnh banner đã được xóa",
    });
  };

  const onSubmit = (values: FormValues) => {
    // Explicitly create a BasicInfoFormData object
    const submitData: BasicInfoFormData = {
      title: values.title,
      artist: values.artist,
      location: values.location,
      address: values.address,
      duration: values.duration,
      description: values.description,
      bannerUrl: bannerPreview || "",
      bannerFile: bannerFile || undefined,
    };
    
    // Lưu dữ liệu trước khi chuyển tab
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
                    onBlur={() => {
                      field.onBlur();
                      handleFieldBlur();
                    }}
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
                    onBlur={() => {
                      field.onBlur();
                      handleFieldBlur();
                    }}
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
                    onBlur={() => {
                      field.onBlur();
                      handleFieldBlur();
                    }}
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
                    onBlur={() => {
                      field.onBlur();
                      handleFieldBlur();
                    }}
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
                  onBlur={() => {
                    field.onBlur();
                    handleFieldBlur();
                  }}
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
                <RichTextEditor
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.trigger("description");
                    handleFieldBlur();
                  }}
                  placeholder="Mô tả chi tiết về sự kiện"
                  className="min-h-[200px]"
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Ảnh banner sự kiện</FormLabel>
            {bannerPreview && (
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={handleRemoveBanner} 
                className="text-xs h-7 px-2 py-1"
              >
                Xóa
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4 max-w-[50rem]">
            {/* Updated container to enforce 16:9 aspect ratio */}
            <div 
              className="border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center w-full overflow-hidden relative"
              style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio (9/16 = 0.5625 = 56.25%)
              onClick={() => document.getElementById('banner-upload')?.click()}
            >
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Status badge for blob URLs vs Cloudinary URLs */}
                  <div className="absolute top-0 right-0 m-2 px-1.5 py-0.5 text-xs rounded bg-black/60 text-white">
                    {bannerPreview.startsWith('blob:') ? 'Chưa lưu' : 'Đã lưu'}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nhấn để tải lên ảnh banner
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG (Tỉ lệ khuyến nghị: 16:9)
                  </p>
                </div>
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
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>
              Hình ảnh sẽ được hiển thị theo tỉ lệ 16:9 trên trang chi tiết sự kiện
            </p>
            <p>
              <strong>Lưu ý:</strong> Ảnh sẽ được tải lên máy chủ khi bạn lưu hoặc đăng sự kiện
            </p>
          </div>
        </div>

        <div className="justify-end hidden sm:flex">
          <Button type="submit" className="gap-2">
            Tiếp theo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};
