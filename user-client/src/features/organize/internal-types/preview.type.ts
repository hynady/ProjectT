/**
 * Types for preview functionality
 */

export interface PreviewShow {
  id: string;
  date: string;
  time: string;
}

export interface PreviewTicket {
  id: string;
  showId: string;
  type: string;
  price: number;
  availableQuantity: number;
}

export interface PreviewGalleryItem {
  id: string;
  url: string;
  image: string;
}

export interface PreviewData {
  id: string;
  title: string;
  artist: string;
  location: string;
  address: string;
  description: string;
  organizer: string;
  bannerUrl: string;
  shows: PreviewShow[];
  tickets: PreviewTicket[];
  gallery: PreviewGalleryItem[];
  category: string;
  region: string;
}

export interface PreviewShowWithPrices extends PreviewShow {
  prices: {
    id: string;
    type: string;
    price: number;
    available: number;
  }[];
  status: string;
}

export interface PreviewHeroData {
  id: string;
  title: string;
  artist: string;
  bannerUrl: string;
  date: string;
  time: string;
  location: string;
  status: string;
  category: string;
  region: string;
}

export interface PreviewOverviewData {
  id: string;
  description: string;
  organizer: string;
}

export interface PreviewLocationData {
  location: string;
  address: string;
}

export interface PreviewGalleryData {
  id: string;
  image: string;
}

export interface PreviewMockData {
  hero: {
    data: PreviewHeroData;
    loading: boolean;
    error: string | null;
  };
  overview: {
    data: PreviewOverviewData;
    loading: boolean;
    error: string | null;
  };
  shows: {
    data: PreviewShowWithPrices[];
    loading: boolean;
    error: string | null;
  };
  location: {
    data: PreviewLocationData;
    loading: boolean;
    error: string | null;
  };
  gallery: {
    data: PreviewGalleryData[];
    loading: boolean;
    error: string | null;
  };
}

export interface PreviewContextType {
  isPreview: boolean;
  previewData: PreviewMockData | null;
}
