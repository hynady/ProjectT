import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/commons/components/carousel.tsx";
import { Button } from "@/commons/components/button.tsx";
import { Badge } from "@/commons/components/badge.tsx";
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from 'react-router-dom';
import { HeroSkeleton } from "@/features/home/skeletons/HeroSkeleton.tsx";
import { Card } from "@/commons/components/card.tsx";
import { HeroSectionUnit } from '@/features/home/internal-types/home';

interface HeroSectionProps {
  occas: HeroSectionUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ occas, isLoading, error }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */ />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!occas || occas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" /* Add empty state icon SVG */ />
        <p className="text-gray-600">Không có sự kiện nào</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        loop: true,
        align: "start",
        containScroll: "trimSnaps",
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
    >
      <CarouselContent className="-ml-4 flex">
        {Array.isArray(occas) ? (
          occas.map((occa) => (
            <CarouselItem
              key={occa.id}
              className="pl-4 md:basis-full lg:basis-1/2 min-w-0"
              onClick={() => navigate(`/occas/${occa.id}`)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer border group">
                <img
                  src={occa.image}
                  alt={occa.title}
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400/8b5cf6/f5f3ff?text=No+Image";
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-primary via-background/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <Card className="max-w-screen-xl mx-auto p-4">
                    <h2
                      className="text-sm sm:text-base md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-1 text-card-foreground">
                      {occa.title}
                    </h2>
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-[10px] sm:text-base md:text-sm mb-4">
                      <Badge className="flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{occa.date}</span>
                      </Badge>
                      <Badge className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{occa.location}</span>
                      </Badge>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                    >
                      Xem chi tiết
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                </div>
              </div>
            </CarouselItem>
          ))) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */ />
            <p className="text-gray-600">Lỗi hệ thống: thành phần không thể hiển thị, thử lại sau</p>
          </div>
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};