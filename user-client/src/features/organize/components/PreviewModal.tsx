import { Button } from "@/commons/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/commons/components/dialog";
import { Eye } from "lucide-react";
import { ReactNode, useState } from "react";
import { OccaFormData } from "../internal-types/organize.type";
import { savePreviewData, getPreviewData, clearPreviewData } from "@/utils/preview.utils";
import { toast } from "@/commons/hooks/use-toast";
import { PreviewData, PreviewGalleryItem, PreviewShow, PreviewTicket } from "../internal-types/preview.type";

interface PreviewModalProps {
  occaData: OccaFormData | null | undefined;
  children?: ReactNode;
  onNavigateToTab?: (tab: string) => void;
}

export const PreviewModal = ({ occaData, children, onNavigateToTab }: PreviewModalProps) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateData = (): { valid: boolean; message: string; missingStep?: string } => {
    if (!occaData) {
      return { valid: false, message: "Không có dữ liệu để xem trước" };
    }
    
    if (!occaData.basicInfo?.title) {
      return { 
        valid: false, 
        message: "Hãy tạo trước một sự kiện", 
        missingStep: "basic-info" 
      };
    }
    
    if (!occaData.shows || occaData.shows.length === 0) {
      return { 
        valid: false, 
        message: "Bạn cần thêm ít nhất một suất diễn để có thể xem trước sự kiện", 
        missingStep: "shows" 
      };
    }
    
    return { valid: true, message: "" };
  };

  const handlePreview = async () => {
    const validation = validateData();
    if (!validation.valid) {
      // Don't show toast anymore, as we'll show the dialog with instructions
      setOpen(true);
      return;
    }

    try {
      setIsProcessing(true);
      // Clear any previous preview data to avoid confusion
      clearPreviewData();
      
      console.log("Starting preview process with data:", occaData);
      
      // Prepare shows with proper type
      const shows: PreviewShow[] = Array.isArray(occaData!.shows) && occaData!.shows.length > 0
        ? occaData!.shows.map(show => ({
            id: show.id || `preview-show-${Math.random().toString(36).substring(2, 11)}`,
            date: show.date || new Date().toISOString().split('T')[0],
            time: show.time || "19:00",
          }))
        : [{
            id: `preview-default-show-${Math.random().toString(36).substring(2, 11)}`,
            date: new Date().toISOString().split('T')[0],
            time: "19:00",
          }];

      // Prepare tickets with proper type
      const tickets: PreviewTicket[] = Array.isArray(occaData!.tickets) && occaData!.tickets.length > 0
        ? occaData!.tickets.map(ticket => ({
            id: ticket.id || `preview-ticket-${Math.random().toString(36).substring(2, 11)}`,
            showId: ticket.showId || shows[0].id,
            type: ticket.type || "Vé Standard",
            price: ticket.price || 0,
            availableQuantity: ticket.availableQuantity || 100,
          }))
        : [{
            id: `preview-default-ticket-${Math.random().toString(36).substring(2, 11)}`,
            showId: shows[0].id,
            type: "Vé Standard",
            price: 200000,
            availableQuantity: 100,
          }];

      // Prepare gallery with proper type
      const gallery: PreviewGalleryItem[] = Array.isArray(occaData!.gallery) && occaData!.gallery.length > 0
        ? occaData!.gallery.map(item => ({
            id: item.id || `preview-gallery-${Math.random().toString(36).substring(2, 11)}`,
            url: item.image || "https://placehold.co/600x400/8b5cf6/f5f3ff?text=Hình+ảnh+sự+kiện",
            image: item.image || "https://placehold.co/600x400/8b5cf6/f5f3ff?text=Hình+ảnh+sự+kiện"
          }))
        : Array(3).fill(0).map((_, index) => ({
            id: `preview-placeholder-gallery-${index}`,
            url: `https://placehold.co/600x400/8b5cf6/f5f3ff?text=Hình+ảnh+sự+kiện+${index+1}`,
            image: `https://placehold.co/600x400/8b5cf6/f5f3ff?text=Hình+ảnh+sự+kiện+${index+1}`
          }));
      
      // Prepare preview data with proper type
      const previewData: PreviewData = {
        id: `preview-${Date.now()}`,
        title: occaData!.basicInfo.title || "Sự kiện mới",
        artist: occaData!.basicInfo.artist || "Nghệ sĩ",
        location: occaData!.basicInfo.location || "Địa điểm",
        address: occaData!.basicInfo.address || "Địa chỉ sẽ được cập nhật sau",
        category: "Danh mục sẽ được thêm sau",
        region: "Khu vực sẽ được thêm sau",
        description: occaData!.basicInfo.description || "Mô tả về sự kiện sẽ được cập nhật sau.",
        organizer: occaData!.basicInfo.organizer || "Người tổ chức",
        bannerUrl: occaData!.basicInfo.bannerUrl || "https://placehold.co/1200x630/8b5cf6/f5f3ff?text=Sự+kiện+mới",
        shows,
        tickets,
        gallery
      };

      console.log("Prepared preview data:", previewData);
      
      // Store data in localStorage
      await savePreviewData(previewData);
      
      // Verify data was saved
      const savedData = getPreviewData();
      if (!savedData) {
        throw new Error("Không thể lưu dữ liệu xem trước vào localStorage");
      }
      
      console.log("Preview data verified in localStorage:", savedData);

      // Open preview in a new tab with the correct URL
      window.open('/preview/occa', '_blank');
      setOpen(false);
    } catch (error) {
      console.error("Error preparing preview data:", error);
      toast({
        title: "Lỗi xem trước",
        description: error instanceof Error ? error.message : "Không thể tạo bản xem trước",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validation = validateData();
  const showMissingDataDialog = !validation.valid;

  const handleNavigateToStep = () => {
    if (validation.missingStep && onNavigateToTab) {
      onNavigateToTab(validation.missingStep);
      setOpen(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (newOpen) {
          // When opening, perform validation first
          const validation = validateData();
          if (!validation.valid) {
            setOpen(true);
          } else {
            handlePreview();
          }
        } else {
          setOpen(false);
        }
      }}
    >
      <DialogTrigger asChild onClick={(e) => {
        // Prevent the default trigger behavior to handle it manually
        e.preventDefault();
        
        // Instead of opening the dialog immediately, validate first
        const validation = validateData();
        if (!validation.valid) {
          setOpen(true);
        } else {
          handlePreview();
        }
      }}>
        {children || (
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="md:hidden lg:inline">Xem trước</span>
          </Button>
        )}
      </DialogTrigger>
      
      {showMissingDataDialog ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xem trước sự kiện</DialogTitle>
            <DialogDescription>
              {validation.message}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground">
              Để xem trước, bạn cần hoàn thành các thông tin cơ bản và thêm ít nhất một suất diễn.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleNavigateToStep}>
              {validation.missingStep === "shows" ? "Thêm suất diễn" : "Quay lại thông tin cơ bản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xem trước sự kiện</DialogTitle>
            <DialogDescription>
              Xem trước trang chi tiết sự kiện của bạn để kiểm tra trước khi đăng
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Khi nhấn "Xem trước", một tab mới sẽ được mở để hiển thị sự kiện của bạn. Lưu ý rằng một số chức năng như đặt vé sẽ không hoạt động trong chế độ xem trước.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handlePreview} disabled={isProcessing} loading={isProcessing}>
              {isProcessing ? 'Đang xử lý...' : 'Xem trước'}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
