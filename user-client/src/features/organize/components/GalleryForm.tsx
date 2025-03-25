import { useState } from "react";
import { Button } from "@/commons/components/button";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import { GalleryItem } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";
import { isCloudinaryUrl } from "@/utils/cloudinary.utils";

interface GalleryFormProps {
  gallery: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
  onBack: () => void;
}

export const GalleryForm = ({ gallery, onChange, onBack }: GalleryFormProps) => {
  // Using an underscore prefix to indicate we know it's only used in handleRemoveImage
  // This is a common convention to tell ESLint this is intentional
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_galleryFiles, set_GalleryFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    if (filesArray.length + gallery.length > 10) {
      toast({
        title: "Giới hạn ảnh",
        description: "Bạn chỉ có thể tải lên tối đa 10 ảnh",
        variant: "destructive",
      });
      return;
    }

    set_GalleryFiles(prev => [...prev, ...filesArray]);

    const newGalleryItems = filesArray.map(file => {
      const id = `gallery-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const objectUrl = URL.createObjectURL(file);

      return {
        id,
        image: objectUrl,
        file: file
      };
    });

    onChange([...gallery, ...newGalleryItems]);

    toast({
      title: "Đã chọn ảnh",
      description: `Đã thêm ${filesArray.length} ảnh vào thư viện. Ảnh sẽ được tải lên khi bạn lưu hoặc đăng sự kiện.`,
    });
    
    // Reset the file input
    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const updatedGallery = [...gallery];
    const removedItem = updatedGallery[index];
    
    // If it's a File object, remove it from the files array
    if (removedItem.file) {
      set_GalleryFiles(prev => prev.filter(f => 
        !removedItem.file || f.name !== removedItem.file.name
      ));
    }

    // If it's a blob URL (not a Cloudinary URL), revoke it to free up memory
    if (removedItem.image && removedItem.image.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.image);
    }

    // Remove the item from the gallery
    updatedGallery.splice(index, 1);
    onChange(updatedGallery);
    
    toast({
      title: "Đã xóa ảnh",
      description: isCloudinaryUrl(removedItem.image) 
        ? "Ảnh sẽ bị xóa khi bạn lưu thay đổi" 
        : "Đã xóa ảnh khỏi thư viện",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-medium">Thư viện ảnh sự kiện</h2>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2 text-xs sm:text-sm"
            onClick={() => document.getElementById('gallery-upload')?.click()}
            disabled={gallery.length >= 10}
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Thêm ảnh</span>
          </Button>
          <input
            type="file"
            id="gallery-upload"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={gallery.length >= 10}
          />
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground">
        Tải lên hình ảnh sự kiện (tối đa 10 ảnh) để hiển thị trong thư viện. Các định dạng được hỗ trợ: JPG, PNG.
      </p>

      <p className="text-xs text-muted-foreground">
        <strong>Lưu ý:</strong> Hình ảnh sẽ được chuyển thành định dạng web tối ưu khi bạn lưu hoặc đăng sự kiện.
      </p>

      {gallery.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-6 sm:p-12 flex flex-col items-center justify-center text-center">
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Chưa có ảnh nào được tải lên
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Nhấn vào nút "Thêm ảnh" để tải lên hình ảnh sự kiện
          </p>
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('gallery-upload')?.click()}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Tải ảnh lên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {gallery.map((item, index) => (
            <div key={item.id || index} className="group relative aspect-square rounded-md overflow-hidden border">
              <img
                src={item.image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Status badge for blob URLs vs Cloudinary URLs */}
              {item.image && (
                <div className="absolute top-0 right-0 m-1 px-1.5 py-0.5 text-xs rounded bg-black/60 text-white">
                  {item.image.startsWith('blob:') ? 'Chưa lưu' : 'Đã lưu'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {gallery.length < 10 && (
            <div
              className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => document.getElementById('gallery-upload')?.click()}
            >
              <div className="flex flex-col items-center text-muted-foreground">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Thêm ảnh</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="justify-between pt-4 hidden sm:flex">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>
    </div>
  );
};
