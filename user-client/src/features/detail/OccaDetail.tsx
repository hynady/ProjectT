import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/commons/components/card.tsx';
import { OccaHeroSection } from './components/OccaHeroSection.tsx';
import { OccaOverview } from "./components/OccaOverview.tsx";
import { OccaShowSelection } from "./components/OccaShowSelection.tsx";
import { OccaGallery } from "./components/OccaGallery.tsx";
import OccaLocation from "./components/OccaLocation.tsx";
import { OccaFAQs } from "./components/OccaFAQs.tsx";
import { OccaBottomCTA } from "./components/OccaBottomCTA.tsx";
import { OccaHeroSkeleton } from "./skeletons/OccaHeroSkeleton.tsx";
import { useOccaDetail } from "./hooks/useOccaDetail.tsx";
import { AlertCircle } from 'lucide-react';
import { OccaOverviewSkeleton } from "./skeletons/OccaOverviewSkeleton";
import { OccaShowsSkeleton } from "./skeletons/OccaShowsSkeleton";
import { OccaGallerySkeleton, OccaLocationSkeleton } from "./skeletons/OccaLocationSkeleton";
import NotFoundPage from '@/commons/blocks/NotFoundPage.tsx';
import { usePreviewData } from '@/features/preview/PreviewOccaDetail';

const ErrorMessage = ({ message, className = '' }: { message: string, className?: string }) => (
  <div className={`p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 ${className}`}>
    <AlertCircle className="h-4 w-4" />
    <p>{message}</p>
  </div>
);

export default function OccaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Luôn gọi các hook cơ bản trước
  const detailData = useOccaDetail(id || '');
  
  // Sử dụng hook usePreviewData một cách an toàn (có thể là undefined)
  const previewContext = usePreviewData?.();
  
  // Xác định xem có đang ở chế độ preview hay không
  const isPreview = Boolean(previewContext?.isPreview);
  
  // Chọn nguồn dữ liệu dựa trên chế độ
  const { hero, shows, gallery, location, overview } = isPreview && previewContext?.previewData
    ? previewContext.previewData
    : detailData;

  useEffect(() => {
    // Không cần redirect nếu đang ở chế độ preview
    if (!isPreview && !id) {
      navigate('/');
    }
  }, [id, navigate, isPreview]);

  if (!isPreview && hero.error?.status === 404) {
    return <NotFoundPage/>;
  }

  // Ẩn OccaBottomCTA trong chế độ preview
  const showBottomCTA = !isPreview && shows.data;

  return (
    <div className="min-h-screen bg-background">
      {hero.loading ? (
        <OccaHeroSkeleton />
      ) : hero.error ? (
        <ErrorMessage className='pt-12 h-28' message="Không thể tải thông tin sự kiện" />
      ) : hero.data && (
        <OccaHeroSection occa={hero.data} />
      )}

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {overview.loading ? (
              <OccaOverviewSkeleton />
            ) : overview.error ? (
              <ErrorMessage message="Không thể tải thông tin chi tiết" />
            ) : overview.data && (
              <OccaOverview
                details={overview.data.description}
                organizer={overview.data.organizer}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            {shows.loading ? (
              <OccaShowsSkeleton />
            ) : shows.error ? (
              <ErrorMessage message="Không thể tải thông tin vé" />
            ) : shows.data && (
              <OccaShowSelection
                shows={shows.data}
                organizer={overview.data?.organizer || ''}
                occaInfo={
                  {
                    id: id ?? 'preview',
                    title: hero.data?.title ?? '',
                    location: location.data?.location ?? '',
                    address: location.data?.address ?? '',
                    duration: hero.data?.duration ?? '',
                    shows: shows.data
                  }
                }
                isPreview={isPreview}
              />
            )}
          </div>
        </div>

        <Card className="p-4 lg:p-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {gallery.loading ? (
              <OccaGallerySkeleton />
            ) : gallery.error ? (
              <ErrorMessage message="Không thể tải hình ảnh" />
            ) : gallery.data && (
              <OccaGallery images={gallery.data} />
            )}

            {location.loading ? (
              <OccaLocationSkeleton />
            ) : location.error ? (
              <ErrorMessage message="Không thể tải thông tin địa điểm" />
            ) : location.data && (
              <OccaLocation
                location={location.data.location}
                address={location.data.address}
                apiKey={apiKey}
              />
            )}
          </div>
        </Card>

        <OccaFAQs />
        {showBottomCTA && <OccaBottomCTA shows={shows.data!} />}
      </main>
    </div>
  );
}