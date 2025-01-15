import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {Facebook, MapPin, MessageCircle, Navigation, Share2, Twitter} from 'lucide-react';
import {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

interface OccaLocationProps {
  location: string;
  address: string;
  apiKey: string;
}

export const OccaLocation = ({ location, address, apiKey }: OccaLocationProps) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${location} + ${address}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location} + ${address}`;
  const [showSharePopover, setShowSharePopover] = useState(false);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'text-[#1877F2]',
      onClick: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}&quote=${encodeURIComponent(`${location} - ${address}`)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'text-[#1DA1F2]',
      onClick: () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(directionsUrl)}&text=${encodeURIComponent(`${location} - ${address}`)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Messenger',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'text-[#0084FF]',
      onClick: () => {
        const url = `fb-messenger://share/?link=${encodeURIComponent(directionsUrl)}&app_id=YOUR_APP_ID`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Copy Link',
      icon: <Share2 className="h-5 w-5" />,
      color: 'text-muted-foreground',
      onClick: () => {
        navigator.clipboard.writeText(directionsUrl);
        alert('Link copied to clipboard');
      }
    }
  ];

  return (
    <section className="lg:col-span-2 space-y-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary"/>
        Địa điểm tổ chức
      </h2>

      <div className="space-y-4">
        {/* Map Preview */}
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted relative group">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Location Details */}
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-primary">{location}</h3>
            <p className="text-muted-foreground text-sm">{address}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => window.open(directionsUrl, '_blank')}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Chỉ đường
            </Button>
            <Popover open={showSharePopover} onOpenChange={setShowSharePopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ địa điểm
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-2">
                  {shareOptions.map((option) => (
                    <Button
                      key={option.name}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        option.onClick();
                        setShowSharePopover(false);
                      }}
                    >
                      <span className={`mr-2 ${option.color}`}>{option.icon}</span>
                      <span>Chia sẻ qua {option.name}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OccaLocation;