import React from 'react';
import { RegionCard } from '../components/VenueCard.tsx';
import {RegionCardSkeleton} from "@/features/home/skeletons/VenueCardSkeleton.tsx";
import { RegionCardUnit } from '@/features/home/internal-types/home.ts';

interface RegionSectionProps {
  regions: RegionCardUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

export const RegionSection: React.FC<RegionSectionProps> = ({ regions, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <RegionCardSkeleton key={index} />
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

  if (!regions || regions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" /* Add empty state icon SVG */ />
        <p className="text-gray-600">Không có sự kiện nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {Array.isArray(regions) ? (
        regions.map((region) => (
          <RegionCard key={region.id} region={region} loading={isLoading} />
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