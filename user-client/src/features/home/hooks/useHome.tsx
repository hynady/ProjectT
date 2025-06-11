import { useEffect, useState } from 'react';
import { homeService } from '../services/home.service';
import { 
  HeroSectionUnit, 
  FeatureOccasSectionUnit, 
  UpcomingOccasSectionUnit,
  CategorySectionUnit,
  RegionCardUnit 
} from '../internal-types/home';


interface SectionState<T> {
  data: T[] | null;
  isLoading: boolean;
  error: string | null;
}

export const useHome = () => {

  const [heroSection, setHeroSection] = useState<SectionState<HeroSectionUnit>>({
    data: null,
    isLoading: true,
    error: null
  });

  const [featuredSection, setFeaturedSection] = useState<SectionState<FeatureOccasSectionUnit>>({
    data: null,
    isLoading: true,
    error: null
  });

  const [upcomingSection, setUpcomingSection] = useState<SectionState<UpcomingOccasSectionUnit>>({
    data: null,
    isLoading: true,
    error: null
  });

  const [categoriesSection, setCategoriesSection] = useState<SectionState<CategorySectionUnit>>({
    data: null,
    isLoading: true,
    error: null
  });

  const [venuesSection, setVenuesSection] = useState<SectionState<RegionCardUnit>>({
    data: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        const data = await homeService.getHeroOccas();
        setHeroSection({ data, isLoading: false, error: null });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setHeroSection({ 
          data: null, 
          isLoading: false, 
          error: 'Hệ thống đang bảo trì phần này. Vui lòng thử lại sau.' 
        });
      }
    };

    const fetchFeaturedSection = async () => {
      try {
        const data = await homeService.getFeaturedOccas();
        setFeaturedSection({ data, isLoading: false, error: null });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setFeaturedSection({ 
          data: null, 
          isLoading: false, 
          error: 'Hệ thống đang bảo trì phần này. Vui lòng thử lại sau.' 
        });
      }
    };

    const fetchUpcomingSection = async () => {
      try {
        const data = await homeService.getUpcomingOccas();
        setUpcomingSection({ data, isLoading: false, error: null });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setUpcomingSection({ 
          data: null, 
          isLoading: false, 
          error: 'Hệ thống đang bảo trì phần này. Vui lòng thử lại sau.' 
        });
      }
    };

    const fetchCategoriesSection = async () => {
      try {
        const data = await homeService.getCategories();
        setCategoriesSection({ data, isLoading: false, error: null });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setCategoriesSection({ 
          data: null, 
          isLoading: false, 
          error: 'Hệ thống đang bảo trì phần này. Vui lòng thử lại sau.' 
        });
      }
    };

    const fetchVenuesSection = async () => {
      try {
        const data = await homeService.getRegions();
        setVenuesSection({ data, isLoading: false, error: null });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setVenuesSection({ 
          data: null, 
          isLoading: false, 
          error: 'Hệ thống đang bảo trì phần này. Vui lòng thử lại sau.' 
        });
      }
    };

    //Execute all fetch functions
    Promise.all([
      fetchHeroSection(),
      fetchFeaturedSection(),
      fetchUpcomingSection(),
      fetchCategoriesSection(),
      fetchVenuesSection()
    ]);

  }, []);

  return {
    heroSection,
    featuredSection,
    upcomingSection,
    categoriesSection,
    regionsSection: venuesSection
  };
};