import React from 'react';
import {OccaCard, OccaCardUnit} from './OccaCard';
import { OccaCardSkeleton } from '../skeletons/OccaCardSkeleton.tsx';

export interface FeatureOccasSectionUnit extends OccaCardUnit {
}

interface FeatureOccasSectionProps {
  occas: FeatureOccasSectionUnit[];
  loading: boolean;
}

export const FeatureOccasSection: React.FC<FeatureOccasSectionProps> = ({ occas, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OccaCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {occas.map((occa) => (
        <OccaCard key={occa.id} occa={occa} loading={loading} />
      ))}
    </div>
  );
};