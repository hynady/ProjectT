// src/pages/HomePage.tsx
import {useState, useEffect} from 'react';
import {Button} from "@/components/ui/button.tsx";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import {Card, CardHeader, CardTitle, CardDescription} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx"
import {ArrowRight, Calendar, MapPin} from 'lucide-react';
import {Category, EventData as Event, Venue} from "@/types";
import Autoplay from "embla-carousel-autoplay";
import {
  getCategories,
  getFeaturedEvents,
  getHeroEvents,
  getUpcomingEvents,
  getVenues
} from "@/services/eventService.tsx";
import {VenueCard} from "@/app/homepage/components/VenueCard.tsx";
import {EventCard} from "@/app/homepage/components/EventCard.tsx";
import {VenueCardSkeleton} from "@/app/homepage/components/skeletons/VenueCardSkeleton.tsx";
import {EventCardSkeleton} from "@/app/homepage/components/skeletons/EventCardSkeleton.tsx";
import {CategorySkeleton} from "@/app/homepage/components/skeletons/CategorySkeleton.tsx";
import {HeroSkeleton} from "@/app/homepage/components/skeletons/HeroSkeleton.tsx";


const HomePage = () => {
  // Add explicit type annotations for all state variables
  const [loading, setLoading] = useState<boolean>(true);
  const [heroEvents, setHeroEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [heroData, featuredData, upcomingData, categoriesData, venuesData] = await Promise.all([
          getHeroEvents(),
          getFeaturedEvents(),
          getUpcomingEvents(),
          getCategories(),
          getVenues()
        ]);

        setHeroEvents(heroData);
        setFeaturedEvents(featuredData);
        setUpcomingEvents(upcomingData);
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

  const renderHeroSection = () => {
    if (loading) {
      return <HeroSkeleton/>;
    }

    return (
      <Carousel
        className="w-full"
        opts={{
          loop: true,
          align: "start",
          containScroll: "trimSnaps",
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className="-ml-4 flex">
          {heroEvents.map((event) => (
            <CarouselItem
              key={event.id}
              className="pl-4 md:basis-full lg:basis-1/2 min-w-0 "
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer border group">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Gradient overlay - adjusted for better readability */}
                <div
                  className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-primary via-background/70 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="max-w-screen-xl mx-auto">
                    <h2
                      className="text-sm sm:text-base md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2 text-card-foreground">
                      {event.title}
                    </h2>
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-[10px] sm:text-base md:text-sm mb-4">
                      <Badge className="flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4"/>
                        <span>{event.date}</span>
                      </Badge>
                      <Badge className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4"/>
                        <span>{event.location}</span>
                      </Badge>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="hover:bg-secondary/80"
                    >
                      Xem chi tiết
                      <ArrowRight className="w-4 h-4 ml-2"/>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    );
  };

  const renderCategories = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length: 8}).map((_, index) => (
            <CategorySkeleton key={index}/>
          ))}
        </div>
      );
    }

    // Định nghĩa mảng các class gradient
    const gradientClasses = [
      "bg-gradient-to-br from-chart-1 to-transparent",
      "bg-gradient-to-br from-chart-2 to-transparent",
      "bg-gradient-to-br from-chart-3 to-transparent",
      "bg-gradient-to-br from-chart-4 to-transparent",
      "bg-gradient-to-br from-chart-5 to-transparent"
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className={`group hover:-translate-y-2 cursor-pointer transition-all duration-300 ease-out ${gradientClasses[index % 5]}`}>
            <CardHeader>
              <CardTitle className="text-lg">
                {category.name}
              </CardTitle>
              <CardDescription>
                <Badge
                variant="secondary">
                  {category.count} sự kiện
                </Badge>

              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };

  const renderVenues = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, index) => (
            <VenueCardSkeleton key={index}/>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue}/>
        ))}
      </div>
    );
  };

  const renderFeaturedEvents = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, index) => (
            <EventCardSkeleton key={index}/>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredEvents.map((event) => (
          <EventCard key={event.id} event={event} loading={loading}/>
        ))}
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 3}).map((_, index) => (
            <EventCardSkeleton key={index}/>
          ))}
        </div>
      );
    }

    return (
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 flex">
          {upcomingEvents.map((event) => (
            <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <EventCard event={event} loading={loading}/>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container max-w-screen-xl mx-auto px-4 space-y-16">
        {/* Hero Section */}
        <section className="relative mb-12">
          {renderHeroSection()}
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-chart-2 to-foreground bg-clip-text text-transparent">
              Danh mục
            </h2>
            <Button variant="ghost" className="text-primary">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          {renderCategories()}
        </section>

        {/* Popular Venues */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-chart-4 to-foreground bg-clip-text text-transparent">
              Địa điểm phổ biến</h2>
            <Button variant="ghost" className="text-primary">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          {renderVenues()}
        </section>

        {/* Featured Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-destructive to-foreground bg-clip-text text-transparent">
              Sự kiện nổi bật</h2>
            <Button variant="ghost" className="text-primary">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          {renderFeaturedEvents()}
        </section>

        {/* Upcoming Events */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Sắp diễn ra</h2>
            <Button variant="ghost" className="text-primary">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          {renderUpcomingEvents()}
        </section>
      </div>
    </div>
  );
};

export default HomePage;