import {
  categoriesSectionData,
  featuredSectionData,
  heroSectionData,
  upcomingSectionData, venuesSectionData
} from "@/app/homepage/services/mock/mockData.tsx";
import {HeroSectionUnit} from "@/app/homepage/components/fragments/HeroSection.tsx";
import {FeatureOccasSectionUnit} from "@/app/homepage/components/fragments/FeatureOccasSection.tsx";
import {UpcomingOccasSectionUnit} from "@/app/homepage/components/fragments/UpcomingOccasSection.tsx";
import {CategorySectionUnit} from "@/app/homepage/components/fragments/CategorySection.tsx";
import {VenueCardUnit} from "@/app/homepage/components/fragments/VenueCard.tsx";

export const getHeroOccas = async (): Promise<HeroSectionUnit[]> => {
  return new Promise<HeroSectionUnit[]>((resolve) => {
    setTimeout(() => resolve(heroSectionData), 1000);
  });
};

export const getFeaturedOccas = async (): Promise<FeatureOccasSectionUnit[]> => {
  return new Promise<FeatureOccasSectionUnit[]>((resolve) => {
    setTimeout(() => resolve(featuredSectionData), 1000);
  });
};

export const getUpcomingOccas = async (): Promise<UpcomingOccasSectionUnit[]> => {
  return new Promise<UpcomingOccasSectionUnit[]>((resolve) => {
    setTimeout(() => resolve(upcomingSectionData), 1000);
  });
};

export const getCategories = async (): Promise<CategorySectionUnit[]> => {
  return new Promise<CategorySectionUnit[]>((resolve) => {
    setTimeout(() => resolve(categoriesSectionData), 1000);
  });
};

export const getVenues = async (): Promise<VenueCardUnit[]> => {
  return new Promise<VenueCardUnit[]>((resolve) => {
    setTimeout(() => resolve(venuesSectionData), 1000);
  });
};