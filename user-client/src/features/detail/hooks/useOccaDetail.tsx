import { useState, useEffect } from 'react';
import { detailService } from '../services/detail.service';
import { GalleryUnit, LocationData, OccaHeroSectionUnit, OccaShowUnit, OverviewData } from '../internal-types/detail.type';

interface ApiError {
  status: number;
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
  const [gallery, setGallery] = useState<SectionState<GalleryUnit[]>>({
    data: [],
    loading: true,
    error: null
  });
  const [location, setLocation] = useState<SectionState<LocationData>>({
    data: null,
    loading: true,
    error: null
  });
  const [overview, setOverview] = useState<SectionState<OverviewData>>({
    data: null,
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
      .catch(error => setLocation({ data: null, loading: false, error }));

    // Fetch overview data
    detailService.getOverviewData(occaId)
      .then(data => setOverview({ data, loading: false, error: null }))
      .catch(error => setOverview({ data: null, loading: false, error }));
  }, [occaId]);

  return {
    hero,
    shows,
    gallery,
    location,
    overview
  };
};