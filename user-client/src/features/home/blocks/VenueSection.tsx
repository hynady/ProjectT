import React from 'react';
import { VenueCard } from '../components/VenueCard.tsx';
import {VenueCardSkeleton} from "@/features/home/skeletons/VenueCardSkeleton.tsx";

interface VenueSectionProps {
  venues: {
    id: string;
    name: string;
    image: string;
    location: string;
    occaCount: number;
  }[];
  loading: boolean;
}

export const VenueSection: React.FC<VenueSectionProps> = ({ venues, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <VenueCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} loading={loading} />
      ))}
    </div>
  );
}