import { useState, useEffect } from 'react';
import { detailService } from '../services/detail.service';
import { OccaHeroSectionUnit, OccaShowUnit } from '../internal-types/detail.type';

interface ApiError {
  response?: {
    status: number;
  };
  message: string;
}

interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export const useOccaDetail = (occaId: string) => {
  const [hero, setHero] = useState<SectionState<OccaHeroSectionUnit>>({
    data: null,
    loading: true,
    error: null
  });
  const [shows, setShows] = useState<SectionState<OccaShowUnit[]>>({
    data: [],
    loading: true,
    error: null
  });
  const [gallery, setGallery] = useState<SectionState<string[]>>({
    data: [],
    loading: true,
    error: null
  });
  const [location, setLocation] = useState<SectionState<{location: string, address: string}>>({
    data: { location: '', address: '' },
    loading: true,
    error: null
  });
  const [overview, setOverview] = useState<SectionState<{details: string, organizer: string}>>({
    data: { details: '', organizer: '' },
    loading: true,
    error: null
  });

  useEffect(() => {
    // Fetch hero data
    detailService.getHeroData(occaId)
      .then(data => setHero({ data, loading: false, error: null }))
      .catch(error => setHero({ data: null, loading: false, error }));

    // Fetch shows data
    detailService.getShowsData(occaId)
      .then(data => setShows({ data, loading: false, error: null }))
      .catch(error => setShows({ data: [], loading: false, error }));

    // Fetch gallery data
    detailService.getGalleryData(occaId)
      .then(data => setGallery({ data, loading: false, error: null }))
      .catch(error => setGallery({ data: [], loading: false, error }));

    // Fetch location data
    detailService.getLocationData(occaId)
      .then(data => setLocation({ data, loading: false, error: null }))
      .catch(error => setLocation({ data: { location: '', address: '' }, loading: false, error }));

    // Fetch overview data
    detailService.getOverviewData(occaId)
      .then(data => setOverview({ data, loading: false, error: null }))
      .catch(error => setOverview({ data: { details: '', organizer: '' }, loading: false, error }));
  }, [occaId]);

  return {
    hero,
    shows,
    gallery,
    location,
    overview
  };
};