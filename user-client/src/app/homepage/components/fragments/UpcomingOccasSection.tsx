import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {OccaCard, OccaCardUnit} from './OccaCard';
import Autoplay from "embla-carousel-autoplay";

export interface UpcomingOccasSectionUnit extends OccaCardUnit {

}

interface UpcomingOccasSectionProps {
  occas: UpcomingOccasSectionUnit[];
  loading: boolean;
}

export const UpcomingOccasSection: React.FC<UpcomingOccasSectionProps> = ({ occas, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
        {occas.map((occa) => (
          <CarouselItem key={occa.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <OccaCard occa={occa} loading={loading} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};