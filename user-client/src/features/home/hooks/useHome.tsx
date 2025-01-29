import { useState } from 'react';
import { homeService } from '../services/home.service';
import { HeroSectionUnit } from '../blocks/HeroSection';
import { FeatureOccasSectionUnit } from '../blocks/FeatureOccasSection';
import { UpcomingOccasSectionUnit } from '../blocks/UpcomingOccasSection';
import { CategorySectionUnit } from '../blocks/CategorySection';
import { VenueCardUnit } from '../components/VenueCard';


export const useHome = () => {
  const [loading, setLoading] = useState(true);
  const [heroOccas, setHeroOccas] = useState<HeroSectionUnit[]>([]);
  const [featuredOccas, setFeaturedOccas] = useState<FeatureOccasSectionUnit[]>([]);
  const [upcomingOccas, setUpcomingOccas] = useState<UpcomingOccasSectionUnit[]>([]);
  const [categories, setCategories] = useState<CategorySectionUnit[]>([]);
  const [venues, setVenues] = useState<VenueCardUnit[]>([]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [heroData, featuredData, upcomingData, categoriesData, venuesData] = await Promise.all([
        homeService.getHeroOccas(),
        homeService.getFeaturedOccas(),
        homeService.getUpcomingOccas(),
        homeService.getCategories(),
        homeService.getVenues()
      ]);

      setHeroOccas(heroData);
      setFeaturedOccas(featuredData);
      setUpcomingOccas(upcomingData);
      setCategories(categoriesData);  
      setVenues(venuesData);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    heroOccas,
    featuredOccas, 
    upcomingOccas,
    categories,
    venues,
    fetchHomeData
  };
};