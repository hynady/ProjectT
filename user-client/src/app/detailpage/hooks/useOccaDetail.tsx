import { useState, useEffect } from 'react';
import {OccaHeroSectionUnit} from "@/app/detailpage/components/fragments/OccaHeroSection.tsx";
import {OccaShowUnit} from "@/app/detailpage/components/fragments/OccaShowSelection.tsx";
import {
  mockGalleryData,
  mockHeroData, mockLocationData,
  mockOverviewData,
  mockShowsData
} from "@/app/detailpage/services/mock/mockData.tsx";


export const useOccaHero = (occaId: string) => {
  const [data, setData] = useState<OccaHeroSectionUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(mockHeroData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, [occaId]);

  return { data, loading, error };
};


export const useOccaShows = (occaId: string) => {
  const [data, setData] = useState<OccaShowUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(mockShowsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [occaId]);

  return { data, loading, error };
};

// hooks/useOccaGallery.ts
export const useOccaGallery = (occaId: string) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setImages(mockGalleryData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [occaId]);

  return { images, loading, error };
};

// hooks/useOccaLocation.ts
export const useOccaLocation = (occaId: string) => {
  const [location, setLocation] = useState({ location: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLocation(mockLocationData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [occaId]);

  return { ...location, loading, error };
};

// hooks/useOccaOverview.ts
export const useOccaOverview = (occaId: string) => {
  const [data, setData] = useState({ details: '', organizer: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(mockOverviewData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [occaId]);

  return { ...data, loading, error };
};