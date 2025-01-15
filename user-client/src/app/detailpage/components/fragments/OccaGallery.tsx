import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ImageIcon } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

interface OccaGalleryProps {
  images: string[];
}

export const OccaGallery = ({ images }: OccaGalleryProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-blue-500"/>
        Hình ảnh sự kiện
      </h2>
      <div className="relative w-full">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          orientation="vertical"
          className="w-full"
        >
          <CarouselContent className="h-[300px] sm:h-[400px] lg:h-[500px]">
            {images.map((image, index) => (
              <CarouselItem key={index} className="pb-4 basis-full lg:basis-1/2">
                <Card className="overflow-hidden h-full">
                  <CardContent className="p-0 h-full">
                    <div className="w-full h-full relative">
                      <img
                        src={image}
                        alt={`Event image ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious/>
          <CarouselNext/>
        </Carousel>
      </div>
    </div>
  );
};