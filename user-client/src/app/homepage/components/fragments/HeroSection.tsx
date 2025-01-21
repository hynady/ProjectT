import React from 'react';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Calendar, MapPin, ArrowRight} from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import {useNavigate} from 'react-router-dom';
import {HeroSkeleton} from "@/app/homepage/components/skeletons/HeroSkeleton.tsx";

export interface HeroSectionUnit {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
}

interface HeroSectionProps {
  occas: HeroSectionUnit[];
  loading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({occas, loading}) => {
  const navigate = useNavigate();

  if (loading) {
    return <HeroSkeleton/>;
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
        {occas.map((occa) => (
          <CarouselItem
            key={occa.id}
            className="pl-4 md:basis-full lg:basis-1/2 min-w-0"
            onClick={() => navigate(`/occas/${occa.id}`)}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer border group">
              <img
                src={occa.image}
                alt={occa.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-primary via-background/70 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="max-w-screen-xl mx-auto">
                  <h2
                    className="text-sm sm:text-base md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2 text-card-foreground">
                    {occa.title}
                  </h2>
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-[10px] sm:text-base md:text-sm mb-4">
                    <Badge className="flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4"/>
                      <span>{occa.date}</span>
                    </Badge>
                    <Badge className="flex items-center gap-1 sm:gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4"/>
                      <span>{occa.location}</span>
                    </Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="hover:bg-secondary/80"
                  >
                    Xem chi tiết
                    <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious/>
      <CarouselNext/>
    </Carousel>
  );
};