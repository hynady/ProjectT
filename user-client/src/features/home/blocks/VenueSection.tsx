import React from 'react';
import { VenueCard } from '../components/VenueCard.tsx';
import {VenueCardSkeleton} from "@/features/home/skeletons/VenueCardSkeleton.tsx";
import { VenueCardUnit } from '@/features/home/internal-types/home.ts';

interface VenueSectionProps {
  venues: VenueCardUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

export const VenueSection: React.FC<VenueSectionProps> = ({ venues, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <VenueCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */ />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" /* Add empty state icon SVG */ />
        <p className="text-gray-600">Không có sự kiện nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {Array.isArray(venues) ? (
        venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} loading={isLoading} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */ />
          <p className="text-gray-600">Lỗi hệ thống: thành phần không thể hiển thị, thử lại sau</p>
        </div>
      )}
    </div>
  );
}