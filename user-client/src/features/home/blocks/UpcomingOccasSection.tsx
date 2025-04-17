import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/commons/components/carousel.tsx";
import { OccaCard } from "../components/OccaCard.tsx";
import Autoplay from "embla-carousel-autoplay";
import { UpcomingOccasSectionUnit } from "@/features/home/internal-types/home.ts";
import { useNavigate } from "react-router-dom";
import { useTracking } from "@/features/tracking/contexts/TrackingContext.tsx";

interface UpcomingOccasSectionProps {
  occas: UpcomingOccasSectionUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

export const UpcomingOccasSection: React.FC<UpcomingOccasSectionProps> = ({
  occas,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();
  const { trackEventClick } = useTracking();
  const handleCardClick = (occaId: string) => {
    trackEventClick(occaId, "upcomingSection");
    navigate(`/occas/${occaId}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg
          className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */
        />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!occas || occas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg
          className="w-12 h-12 text-gray-400 mb-4" /* Add empty state icon SVG */
        />
        <p className="text-gray-600">Không có sự kiện nào</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-4 flex">
        {Array.isArray(occas) ? (
          occas.map((occa) => (
            <CarouselItem
              key={occa.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <OccaCard
                occa={occa}
                loading={isLoading}
                handleCardClick={() => handleCardClick(occa.id)}
              />
            </CarouselItem>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
            <svg
              className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */
            />
            <p className="text-gray-600">
              Lỗi hệ thống: thành phần không thể hiển thị, thử lại sau
            </p>
          </div>
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
