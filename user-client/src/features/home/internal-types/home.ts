export interface HeroSectionUnit {
    id: string;
    title: string;
    image: string;
    date: string;
    location: string;
  }
  
  export interface OccaCardUnit {
    id: string;
    title: string;
    image: string;
    date: string;
    time: string;
    location: string;
    price: number;
    categoryId?: string;
    venueId?: string;
  }
  
  export interface CategorySectionUnit {
    id: string;
    name: string;
    count: number;
  }
  
  export interface VenueCardUnit {
    id: string;
    regionImage: string;
    regionName: string;
    occaCount: number;
  }
  
  export type FeatureOccasSectionUnit = OccaCardUnit;
  export type UpcomingOccasSectionUnit = OccaCardUnit;