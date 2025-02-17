// Define the type for Hero Section Unit
export interface OccaHeroSectionUnit {
  title: string;
  artist: string;
  bannerUrl: string;
  date: string;
  time: string;
  duration: string;
  location: string;
}

// Define the type for Show Unit
export interface OccaShowUnit {
  date: string;
  time: string;
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