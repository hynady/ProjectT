import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/commons/components/alert";
import { Button } from "@/commons/components/button";
import EventDetailPage from "@/features/detail/OccaDetail";
import { getPreviewData, clearPreviewData, hasPreviewData } from "@/utils/preview.utils";
import { toast } from "@/commons/hooks/use-toast";
import { createContext, useContext } from 'react';
import { 
  PreviewContextType, 
  PreviewMockData,
  PreviewGalleryData,
  PreviewShowWithPrices
} from "../../internal-types/preview.type";

// Context để cung cấp mock data cho component OccaDetail
export const PreviewDataContext = createContext<PreviewContextType | undefined>(undefined);

// Hook để sử dụng trong OccaDetail và các components con
export const usePreviewData = () => {
  const context = useContext(PreviewDataContext);
  // Không throw error nếu context là undefined (cho phép sử dụng bên ngoài provider)
  return context;
};

const PreviewOccaDetail = () => {
  const [loading, setLoading] = useState(true);
  const [mockData, setMockData] = useState<PreviewMockData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get data from localStorage
        console.log("Checking for preview data in localStorage...");
        setDebugInfo("Checking localStorage...");
        
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
          throw new Error("localStorage is not available in this browser");
        }
        
        setDebugInfo("Testing localStorage access...");
        try {
          localStorage.setItem('test_preview_access', 'test');
          localStorage.removeItem('test_preview_access');
        } catch (e) {
          throw new Error("localStorage is not accessible: " + (e instanceof Error ? e.message : String(e)));
        }
        
        // Check if preview data exists
        setDebugInfo("Checking if preview data exists...");
        const hasData = hasPreviewData();
        console.log("Preview data exists:", hasData);
        
        if (!hasData) {
          throw new Error("Không tìm thấy dữ liệu xem trước trong localStorage");
        }
        
        // Get preview data
        setDebugInfo("Retrieving preview data...");
        const previewData = getPreviewData();
        console.log("Retrieved preview data:", previewData);
        
        if (!previewData) {
          throw new Error("Dữ liệu xem trước không tồn tại hoặc không hợp lệ");
        }

        // Create mock data structure matching what OccaDetail expects
        setDebugInfo("Creating mock data for preview...");
        
        // Map tickets to shows
        const showsWithPrices: PreviewShowWithPrices[] = (previewData.shows || []).map((show) => ({
          id: show.id || `preview-show-${Math.random().toString(36).substring(2, 11)}`,
          date: show.date || new Date().toISOString().split('T')[0],
          time: show.time || "19:00",
          // Attach prices to each show
          prices: (previewData.tickets || [])
            .filter((ticket) => ticket.showId === show.id)
            .map((ticket) => ({
              id: ticket.id || `preview-ticket-${Math.random().toString(36).substring(2, 11)}`,
              type: ticket.type || "Vé Standard",
              price: ticket.price || 200000,
              available: ticket.availableQuantity || 100
            })),
          status: "available"
        }));
        
        // Generate gallery items
        const galleryItems: PreviewGalleryData[] = Array.isArray(previewData.gallery) && previewData.gallery.length > 0 
          ? previewData.gallery.map((item) => ({
              id: item.id || `preview-gallery-${Math.random().toString(36).substring(2, 11)}`,
              image: item.url || item.image || "https://placehold.co/600x400/8b5cf6/f5f3ff?text=Hình+ảnh+sự+kiện",
            }))
          : Array(3).fill(0).map((_, index) => ({
              id: `preview-placeholder-gallery-${index}`,
              image: `https://placehold.co/600x400/8b5cf6/f5f3ff?text=Hình+ảnh+sự+kiện+${index+1}`,
            }));

        const mockDataStructure: PreviewMockData = {
          hero: {
            data: {
              id: previewData.id || `preview-${Date.now()}`,
              title: previewData.title || "Sự kiện mới",
              artist: previewData.artist || "Nghệ sĩ",
              bannerUrl: previewData.bannerUrl || "https://placehold.co/1200x630/8b5cf6/f5f3ff?text=Sự+kiện+mới",
              date: previewData.shows?.length > 0 ? previewData.shows[0].date : new Date().toISOString().split('T')[0],
              time: previewData.shows?.length > 0 ? previewData.shows[0].time : "19:00",
              duration: (previewData.duration || 120).toString(),
              location: previewData.location || "Địa điểm",
              status: "active", // Add status for preview
            },
            loading: false,
            error: null
          },
          overview: {
            data: {
              id: previewData.id || `preview-${Date.now()}`,
              description: previewData.description || "Mô tả về sự kiện sẽ được cập nhật sau.",
              organizer: "Preview Organizer"
            },
            loading: false,
            error: null
          },
          shows: {
            data: showsWithPrices,
            loading: false,
            error: null
          },
          location: {
            data: {
              location: previewData.location || "Địa điểm",
              address: previewData.address || "Địa chỉ sẽ được cập nhật sau"
            },
            loading: false,
            error: null
          },
          gallery: {
            data: galleryItems,
            loading: false,
            error: null
          }
        };

        // Fix ticket associations if needed
        if (mockDataStructure.shows.data.length > 0) {
          // If there are shows without any tickets, add a default ticket
          mockDataStructure.shows.data.forEach((show) => {
            if (!show.prices || show.prices.length === 0) {
              show.prices = [{
                id: `preview-ticket-default-${show.id}`,
                type: "Vé Mẫu",
                price: 200000,
                available: 100
              }];
            }
          });
        }

        console.log("Created mock data for preview:", mockDataStructure);
        setMockData(mockDataStructure);
      } catch (error) {
        console.error("Error parsing preview data:", error);
        setError(error instanceof Error ? error.message : "Dữ liệu xem trước không hợp lệ");
        setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Clean up function
    return () => {
      // We'll keep the preview data for now to aid debugging
    };
  }, []);

  const handleClose = () => {
    window.close();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleClear = () => {
    clearPreviewData();
    toast({
      title: "Đã xóa dữ liệu",
      description: "Dữ liệu xem trước đã được xóa khỏi localStorage",
    });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">{debugInfo}</p>
      </div>
    );
  }

  if (error || !mockData) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Lỗi xem trước</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <span>{error || "Không thể tải dữ liệu xem trước"}</span>
            <div className="mt-4 p-2 bg-background/80 rounded text-xs font-mono text-muted-foreground overflow-auto max-h-40">
              {debugInfo || "Không có thông tin debug"}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleClear}>
                Xóa dữ liệu
              </Button>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Thử lại
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Đóng
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Wrap the EventDetailPage with our context provider to pass the mock data
  return (
    <PreviewDataContext.Provider value={{ isPreview: true, previewData: mockData }}>
      <Alert className="mb-4 sticky top-0 z-50">
        <AlertTitle>Chế độ xem trước</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Đây là bản xem trước của sự kiện. Một số tính năng như đặt vé sẽ không hoạt động.</span>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Đóng
          </Button>
        </AlertDescription>
      </Alert>
      
      {/* Use the actual EventDetailPage component */}
      <EventDetailPage />
    </PreviewDataContext.Provider>
  );
};

export default PreviewOccaDetail;
