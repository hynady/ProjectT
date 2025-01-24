// pages/HomePage.tsx
import {useState, useEffect} from 'react';

import {Button} from "@/commons/components/button.tsx";
import {ArrowRight} from 'lucide-react';
import {HeroSection, HeroSectionUnit} from "@/features/home/blocks/HeroSection.tsx";
import {CategorySection, CategorySectionUnit} from "@/features/home/blocks/CategorySection.tsx";
import {VenueSection} from "@/features/home/blocks/VenueSection.tsx";
import {
  FeatureOccasSection,
  FeatureOccasSectionUnit
} from "@/features/home/blocks/FeatureOccasSection.tsx";
import {
  UpcomingOccasSection,
  UpcomingOccasSectionUnit
} from "@/features/home/blocks/UpcomingOccasSection.tsx";
import {
  getCategories,
  getFeaturedOccas,
  getHeroOccas,
  getUpcomingOccas, getVenues
} from "@/features/home/hooks/occaHomePageServices.tsx";
import {VenueCardUnit} from "@/features/home/components/VenueCard.tsx";
import {useNavigate} from "react-router-dom";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [heroOccas, setHeroOccas] = useState<HeroSectionUnit[]>([]);
  const [featuredOccas, setFeaturedOccas] = useState<FeatureOccasSectionUnit[]>([]);
  const [upcomingOccas, setUpcomingOccas] = useState<UpcomingOccasSectionUnit[]>([]);
  const [categories, setCategories] = useState<CategorySectionUnit[]>([]);
  const [venues, setVenues] = useState<VenueCardUnit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [heroData, featuredData, upcomingData, categoriesData, venuesData] = await Promise.all([
          getHeroOccas(),
          getFeaturedOccas(),
          getUpcomingOccas(),
          getCategories(),
          getVenues()
        ]);

        setHeroOccas(heroData);
        setFeaturedOccas(featuredData);
        setUpcomingOccas(upcomingData);
        setCategories(categoriesData);
        setVenues(venuesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewAllClick = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container max-w-screen-xl mx-auto px-4 space-y-16">
        <section className="relative mb-12">
          <HeroSection occas={heroOccas} loading={loading}/>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-chart-2 to-foreground bg-clip-text text-transparent">
              Danh mục
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}>
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          <CategorySection categories={categories} loading={loading}/>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-chart-4 to-foreground bg-clip-text text-transparent">
              Địa điểm phổ biến
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}>
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          <VenueSection venues={venues} loading={loading}/>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-destructive to-foreground bg-clip-text text-transparent">
              Sự kiện nổi bật
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}>
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          <FeatureOccasSection occas={featuredOccas} loading={loading}/>
        </section>

        <section className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Sắp diễn ra
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}>
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          <UpcomingOccasSection occas={upcomingOccas} loading={loading}/>
        </section>
      </div>
    </div>
  );
};

export default HomePage;