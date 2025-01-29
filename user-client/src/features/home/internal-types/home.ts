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
    price: string;
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
    name: string;
    image: string;
    location: string;
    occaCount: number;
  }
  
  export interface FeatureOccasSectionUnit extends OccaCardUnit {}
  export interface UpcomingOccasSectionUnit extends OccaCardUnit {}