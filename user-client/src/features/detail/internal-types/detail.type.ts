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
  id: string;
  date: string;
  time: string;
  prices: {
    id: string;
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
  description: string;
  organizer: string;
}

export interface GalleryUnit {
  image: string;
}


export interface BookingInfo {
  occa: {
    id: string;
    title: string; 
    location: string;
    address: string;
    shows: OccaShowUnit[];
  };
  selectedShow?: {
    id: string;
    date: string;
    time: string; 
  };
  selectedTicket?: {
    id: string;
    type: string;
    price: number;
    quantity: number;
  };
}