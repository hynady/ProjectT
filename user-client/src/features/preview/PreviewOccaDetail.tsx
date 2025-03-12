import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/commons/components/alert";
import { Button } from "@/commons/components/button";
import EventDetailPage from "@/features/detail/OccaDetail";

// Mock data context provider để override các API calls trong OccaDetail
import { createContext, useContext } from 'react';

// Định nghĩa kiểu dữ liệu cho context
interface PreviewContextType {
  isPreview: boolean;
  previewData: any | null;
}

// Context để cung cấp mock data cho component OccaDetail
export const PreviewDataContext = createContext<PreviewContextType | undefined>(undefined);

// Hook để sử dụng trong OccaDetail và các components con
export const usePreviewData = () => {
  const context = useContext(PreviewDataContext);
  // Không throw error nếu context là undefined (cho phép sử dụng bên ngoài provider)
  return context;
};

const PreviewOccaDetail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [mockData, setMockData] = useState<any>(null);

  useEffect(() => {
    // Parse data from URL parameters
    const parseData = () => {
      try {
        const title = searchParams.get('title') || "Tên sự kiện";
        const artist = searchParams.get('artist') || "Nghệ sĩ";
        const location = searchParams.get('location') || "Địa điểm";
        const address = searchParams.get('address') || "Địa chỉ";
        const duration = parseInt(searchParams.get('duration') || "120");
        const description = searchParams.get('description') || "";
        const bannerUrl = searchParams.get('bannerUrl') || "";
        
        const showsStr = searchParams.get('shows') || "[]";
        const shows = JSON.parse(showsStr);
        
        const ticketsStr = searchParams.get('tickets') || "[]";
        const tickets = JSON.parse(ticketsStr);
        
        const galleryStr = searchParams.get('gallery') || "[]";
        const gallery = JSON.parse(galleryStr);

        // Create mock data structure matching what OccaDetail expects
        const mockData = {
          hero: {
            data: {
              title,
              artist,
              bannerUrl,
              date: shows.length > 0 ? shows[0].date : new Date().toISOString().split('T')[0],
              time: shows.length > 0 ? shows[0].time : "19:00",
              duration: duration.toString(),
              location
            },
            loading: false,
            error: null
          },
          overview: {
            data: {
              description,
              organizer: "Preview Organizer"
            },
            loading: false,
            error: null
          },
          shows: {
            data: shows.map((show: any) => ({
              ...show,
              prices: tickets.filter((ticket: any) => ticket.showId === show.id).map((ticket: any) => ({
                id: ticket.id || `preview-ticket-${Math.random()}`,
                type: ticket.type,
                price: ticket.price,
                available: ticket.availableQuantity
              }))
            })),
            loading: false,
            error: null
          },
          location: {
            data: {
              location,
              address
            },
            loading: false,
            error: null
          },
          gallery: {
            data: gallery.map((item: any) => ({
              image: item.url || item.image || "",
            })),
            loading: false,
            error: null
          }
        };

        setMockData(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing preview data:", error);
        setLoading(false);
      }
    };

    parseData();
  }, [searchParams]);

  const handleClose = () => {
    window.close();
  };

  if (loading || !mockData) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Wrap the EventDetailPage with our context provider to pass the mock data
  return (
    <PreviewDataContext.Provider value={{ isPreview: true, previewData: mockData }}>
      <Alert className="mb-4 sticky top-0 z-50">
        <AlertTitle>Chế độ xem trước</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Đây là bản xem trước của sự kiện. Một số tính năng có thể không hoạt động.</span>
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
