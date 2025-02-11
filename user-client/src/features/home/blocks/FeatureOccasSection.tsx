import React from 'react';
import { OccaCard } from '../components/OccaCard.tsx';
import { OccaCardSkeleton } from '../skeletons/OccaCardSkeleton.tsx';
import { FeatureOccasSectionUnit } from '@/features/home/internal-types/home.ts';

interface FeatureOccasSectionProps {
  occas: FeatureOccasSectionUnit[] | null;
  isLoading: boolean;
  error: string | null;
}

export const FeatureOccasSection: React.FC<FeatureOccasSectionProps> = ({ occas, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OccaCardSkeleton key={index} />
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

  if (!occas || occas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" /* Add empty state icon SVG */ />
        <p className="text-gray-600">Không có sự kiện nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(occas) ? (
        occas.map((occa) => (
          <OccaCard key={occa.id} occa={occa} loading={isLoading} />
        ))
      ) :
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mb-4" /* Add maintenance icon SVG */ />
          <p className="text-gray-600">Lỗi hệ thống: thành phần không thể hiển thị, thử lại sau</p>
        </div>
      }
    </div>
  );
};