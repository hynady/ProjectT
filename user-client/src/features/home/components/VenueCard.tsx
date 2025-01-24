import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/commons/components/card.tsx";
import {MapPin} from 'lucide-react';
import {useNavigate} from "react-router-dom";

export interface VenueCardUnit {
  id: string;
  name: string;
  image: string;
  location: string;
  occaCount: number;
}

interface VenueCardProps {
  venue: VenueCardUnit;
  loading: boolean;
}

export const VenueCard: React.FC<VenueCardProps> = ({venue, loading}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      //Skeleton shadcn be added here
      <></>
    );
  }

  const handleCardClick = () => {
    navigate(`/search?venueId=${venue.id}`);
  }

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden"
      onClick={() => {
        handleCardClick()
      }}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 group-hover:text-primary">{venue.name}</CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4"/>
            <span>{venue.location}</span>
          </div>
          <span>{venue.occaCount} sự kiện</span>
        </div>
      </CardContent>
    </Card>
  );
};