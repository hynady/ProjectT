// pages/OccaDetail.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {useOccaGallery, useOccaHero, useOccaLocation, useOccaOverview, useOccaShows} from '@/app/detailpage/hooks/useOccaDetail';
import { OccaHeroSection } from './fragments/OccaHeroSection';
import {OccaOverview} from "@/app/detailpage/components/fragments/OccaOverview.tsx";
import {OccaShowSelection} from "@/app/detailpage/components/fragments/OccaShowSelection.tsx";
import {OccaGallery} from "@/app/detailpage/components/fragments/OccaGallery.tsx";
import OccaLocation from "@/app/detailpage/components/fragments/OccaLocation.tsx";
import {OccaFAQs} from "@/app/detailpage/components/fragments/OccaFAQs.tsx";
import {OccaBottomCTA} from "@/app/detailpage/components/fragments/OccaBottomCTA.tsx";
import {OccaDetailSkeleton} from "@/app/detailpage/components/skeletons/OccaDetailSkeleton.tsx";


export default function OccaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Sử dụng các hooks riêng biệt
  const { data: heroData, loading: heroLoading } = useOccaHero(id || '');
  const { data: shows, loading: showsLoading } = useOccaShows(id || '');
  const { images, loading: galleryLoading } = useOccaGallery(id || '');
  const { location, address, loading: locationLoading } = useOccaLocation(id || '');
  const { details, organizer, loading: overviewLoading } = useOccaOverview(id || '');

  // Kiểm tra loading state tổng thể
  const isLoading = heroLoading || showsLoading || galleryLoading || locationLoading || overviewLoading;

  useEffect(() => {
    if (!id) {
      navigate('/');
    }
  }, [id, navigate]);

  if (isLoading) {
    return <OccaDetailSkeleton />;
  }

  if (!heroData) {
    return <div>Not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <OccaHeroSection occa={heroData} />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OccaOverview
              details={details}
              organizer={organizer}
            />
          </div>

          <div className="lg:col-span-1">
            <OccaShowSelection
              shows={shows}
              organizer={organizer}
            />
          </div>
        </div>

        <Card className="p-4 lg:p-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <OccaGallery images={images} />
            <OccaLocation
              location={location}
              address={address}
              apiKey={apiKey}
            />
          </div>
        </Card>

        <OccaFAQs />
        <OccaBottomCTA shows={shows} />
      </main>
    </div>
  );
}