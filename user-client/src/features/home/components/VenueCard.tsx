import React from 'react';
import {Card, CardContent, CardHeader} from "@/commons/components/card.tsx";
import {useNavigate} from "react-router-dom";
import { VenueCardUnit } from '@/features/home/internal-types/home';
import { Skeleton } from '@/commons/components/skeleton';

const gradientClasses = [
  'from-rose-500',
  'from-pink-500',
  'from-fuchsia-500',
  'from-purple-500',
  'from-violet-500',
  'from-indigo-500',
  'from-blue-500',
  'from-cyan-500',
  'from-teal-500',
  'from-emerald-500',
] as const;

interface VenueCardProps {
  venue: VenueCardUnit;
  loading: boolean;
}

export const VenueCard: React.FC<VenueCardProps> = ({venue, loading}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      // Add skeleton loader Shadcn
      // Using Shadcn Skeleton
      <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden">
            <Skeleton className="w-full h-48 bg-gray-300"/>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Skeleton className="w-16 h-4 bg-gray-300"/>
            </div>
            <Skeleton className="w-16 h-4 bg-gray-300"/>
          </div>
        </CardContent>
      </Card>
    );
  }

  const randomGradient = gradientClasses[Math.floor(Math.random() * gradientClasses.length)];

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
        alt={venue.region}
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/600x400/8b5cf6/f5f3ff?text=No+Image";
        }}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
      </div>
      </CardHeader>
      <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div 
          className={`text-2xl font-bold bg-gradient-to-r ${randomGradient} to-foreground bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}
        >
          {venue.region}
        </div>
        <span className="text-sm text-muted-foreground">{venue.occaCount} sự kiện</span>
      </div>
      </CardContent>
    </Card>
  );
};