// Define the type for Hero Section Unit
export interface OccaHeroSectionUnit {
  id: string;
  title: string;
  artist: string;
  description: string;
  bannerUrl: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address: string;
  organizer: string;
  highlights: string[];
}

// Define the type for Show Unit
export interface OccaShowUnit {
  id: string;
  date: string;
  time: string;
  duration: string;
  prices: {
    type: string;
    price: number;
    available: number;
  }[];
}

// Define the type for Location Data
export interface LocationData {
  location: string;
  address: string;
}

// Define the type for Overview Data
export interface OverviewData {
  details: string;
  organizer: string;
}