import { useState, useEffect } from 'react';
import { detailService } from '../services/detail.service';
import { OccaHeroSectionUnit, OccaShowUnit } from '../internal-types/detail.type';

export const useOccaDetail = (occaId: string) => {
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState<OccaHeroSectionUnit | null>(null);
  const [showsData, setShowsData] = useState<OccaShowUnit[]>([]);
  const [galleryData, setGalleryData] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<{ location: string, address: string }>({ location: '', address: '' });
  const [overviewData, setOverviewData] = useState<{ details: string, organizer: string }>({ details: '', organizer: '' });
  const [error, setError] = useState<Error | null>(null);

  const fetchOccaDetail = async () => {
    setLoading(true);
    try {
      const [hero, shows, gallery, location, overview] = await Promise.all([
        detailService.getHeroData(occaId),
        detailService.getShowsData(occaId),
        detailService.getGalleryData(occaId),
        detailService.getLocationData(occaId),
        detailService.getOverviewData(occaId)
      ]);

      setHeroData(hero);
      setShowsData(shows);
      setGalleryData(gallery);
      setLocationData(location);
      setOverviewData(overview);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccaDetail();
  }, [occaId]);

  return {
    loading,
    heroData,
    showsData,
    galleryData,
    locationData,
    overviewData,
    error
  };
};