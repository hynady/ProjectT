import { Badge } from '@/commons/components/badge.tsx';
import { Card } from '@/commons/components/card.tsx';
import { Calendar, Clock, MapPin } from 'lucide-react';
import {OccaHeroActions} from "@/features/detail/components/OccaHeroActions.tsx";
import { OccaHeroSectionUnit } from '@/features/detail/internal-types/detail.type';

interface OccaHeroSectionProps {
  occa: OccaHeroSectionUnit;
}

export const OccaHeroSection = ({ occa }: OccaHeroSectionProps) => {
  return (
    <div className="relative h-[80vh]">
      <div className="absolute inset-0 animate-fade-down animate-ease-in-out">
        <img
          src={occa.bannerUrl}
          alt={occa.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"/>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <Card className="animate-fade-up animate-ease-in-out p-6 flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:justify-between lg:items-end lg:space-y-0 lg:gap-6">
            <div className="space-y-2 sm:space-y-4">
              <div className="hidden sm:flex flex-wrap gap-1.5 sm:gap-2">
                <Badge variant="default" className="text-xs sm:text-sm">{occa.region}</Badge>
                <Badge variant="primary" className="text-xs sm:text-sm">{occa.category}</Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {occa.title}
              </h1>

              <p className="sm:block text-lg sm:text-xl md:text-2xl text-muted-foreground">
                {occa.artist}
              </p>

              <div className="hidden sm:flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 md:gap-6 text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary"/>
                  {new Date(occa.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '/')}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary"/>
                  <span className="text-xs sm:text-sm md:text-base">
                    {occa.time.includes(':') 
                      ? occa.time.substring(0, occa.time.lastIndexOf(':')) 
                      : occa.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary"/>
                  <span className="text-xs sm:text-sm md:text-base">{occa.location}</span>
                </div>
              </div>
            </div>
            <OccaHeroActions />
          </Card>
        </div>
      </div>
    </div>
  );
};