import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/commons/components/dialog";
import { Button } from "@/commons/components/button";
import { Eye, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/commons/components/toggle-group";
import { cn } from "@/commons/lib/utils/utils";
import { OccaFormData } from "../internal-types/organize.type";
import { OccaCard } from "@/features/home/components/OccaCard";
import { format } from "date-fns";

interface PreviewModalProps {
  data: OccaFormData;
  trigger?: React.ReactNode;
}

export const PreviewModal = ({ data, trigger }: PreviewModalProps) => {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'detail'>('card');

  const transformToCardData = (data: OccaFormData) => {
    const earliestShow = data.shows.length > 0
      ? data.shows.reduce((earliest, current) => {
          const currentDate = new Date(`${current.date}T${current.time}`);
          const earliestDate = new Date(`${earliest.date}T${earliest.time}`);
          return currentDate < earliestDate ? current : earliest;
        }, data.shows[0])
      : null;
    
    // Get lowest ticket price
    const lowestPrice = data.tickets.length > 0
      ? Math.min(...data.tickets.map(ticket => ticket.price))
      : 0;

    return {
      id: "preview",
      title: data.basicInfo.title || "Tên sự kiện",
      artist: data.basicInfo.artist || "Nghệ sĩ",
      location: data.basicInfo.location || "Địa điểm",
      date: earliestShow ? format(new Date(earliestShow.date), 'dd/MM/yyyy') : "Chưa có ngày",
      time: earliestShow ? earliestShow.time : "Chưa có giờ",
      image: data.basicInfo.bannerUrl || "https://placehold.co/600x400/8b5cf6/f5f3ff?text=Chưa+có+ảnh",
      price: lowestPrice
    };
  };

  const handleDetailPreview = () => {
    // Transform data into query string for the preview route
    const transformedData = {
      title: data.basicInfo.title || "Tên sự kiện",
      artist: data.basicInfo.artist || "Nghệ sĩ",
      location: data.basicInfo.location || "Địa điểm",
      address: data.basicInfo.address || "Địa chỉ",
      duration: data.basicInfo.duration,
      description: data.basicInfo.description || "",
      bannerUrl: data.basicInfo.bannerUrl || "",
      shows: JSON.stringify(data.shows),
      tickets: JSON.stringify(data.tickets),
      gallery: JSON.stringify(data.gallery.map(item => ({
        id: item.id,
        url: item.image
      })))
    };
    
    // Create query string
    const queryParams = new URLSearchParams();
    Object.entries(transformedData).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });
    
    // Open in new tab
    window.open(`/preview/occa?${queryParams.toString()}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Xem trước
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn(
        "max-w-[95vw] w-auto max-h-[90vh] overflow-y-auto",
        viewMode === 'detail' ? "sm:max-w-4xl" : "sm:max-w-lg"
      )}>
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Xem trước sự kiện</DialogTitle>
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'card' | 'detail')}>
              <ToggleGroupItem value="card" aria-label="Card View">
                Card
              </ToggleGroupItem>
              <ToggleGroupItem value="detail" aria-label="Detail View">
                Chi tiết
              </ToggleGroupItem>
            </ToggleGroup>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="mt-4 relative">
          {viewMode === 'card' ? (
            <div className="max-w-sm mx-auto">
              <OccaCard 
                occa={transformToCardData(data)} 
                loading={false} 
                isPreview={true} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-4">
              <p className="text-center text-muted-foreground">
                Xem trước trang chi tiết sự kiện
              </p>
              <Button onClick={handleDetailPreview}>
                Mở trang chi tiết sự kiện
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
