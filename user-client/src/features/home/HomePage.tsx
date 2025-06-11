// pages/HomePage.tsx
import { Button } from "@/commons/components/button.tsx";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/features/home/blocks/HeroSection.tsx";
import { CategorySection } from "@/features/home/blocks/CategorySection.tsx";
import { RegionSection } from "@/features/home/blocks/VenueSection.tsx";
import { FeatureOccasSection } from "@/features/home/blocks/FeatureOccasSection.tsx";
import { UpcomingOccasSection } from "@/features/home/blocks/UpcomingOccasSection.tsx";
import { useNavigate } from "react-router-dom";
import { useHome } from "@/features/home/hooks/useHome";

const HomePage = () => {
  const navigate = useNavigate();
  const {
    heroSection,
    categoriesSection,
    regionsSection,
    featuredSection,
    upcomingSection,
  } = useHome();

  const handleViewAllClick = () => {
    navigate("/search");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container max-w-screen-xl mx-auto px-4 space-y-16">
        <section className="relative mb-12">
          <HeroSection
            occas={heroSection.data}
            isLoading={heroSection.isLoading}
            error={heroSection.error}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-chart-2 to-foreground bg-clip-text text-transparent">
              Danh mục
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <CategorySection
            categories={categoriesSection.data}
            isLoading={categoriesSection.isLoading}
            error={categoriesSection.error}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-chart-4 to-foreground bg-clip-text text-transparent">
              Địa điểm phổ biến
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <RegionSection
            regions={regionsSection.data}
            isLoading={regionsSection.isLoading}
            error={regionsSection.error}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-destructive to-foreground bg-clip-text text-transparent">
              Sự kiện nổi bật
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <FeatureOccasSection
            occas={featuredSection.data}
            isLoading={featuredSection.isLoading}
            error={featuredSection.error}
          />
        </section>

        <section className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Sắp diễn ra
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={handleViewAllClick}
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <UpcomingOccasSection
            occas={upcomingSection.data}
            isLoading={upcomingSection.isLoading}
            error={upcomingSection.error}
          />
        </section>
      </div>
    </div>
  );
};

export default HomePage;