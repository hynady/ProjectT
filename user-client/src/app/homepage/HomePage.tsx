import React from 'react';
import {useState, useEffect} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {Skeleton} from "@/components/ui/skeleton";
import {Calendar, MapPin, Clock, ArrowRight} from 'lucide-react';
// Define interfaces for type safety
interface Event {
  id: number;
  title: string;
  image: string;
  date: string;
  location: string;
  time: string;
  price: string;
}

interface Category {
  id: number;
  name: string;
  count: number;
}

interface EventCardProps {
  event: Event;
  loading: boolean;
}

interface Venue {
  id: number;
  name: string;
  image: string;
  location: string;
  eventCount: number;
}

// Mock data for Hero Carousel
const heroCarouselEvents: Event[] = [
  {
    id: 1,
    title: "Concert Taylor Swift The Eras Tour",
    image: "https://placehold.co/800x400",
    date: "30/12/2024",
    location: "SVĐ Mỹ Đình, Hà Nội",
    time: "19:00",
    price: "1.500.000đ - 9.000.000đ",
  },
  {
    id: 2,
    title: "Coldplay Music Of The Spheres",
    image: "https://placehold.co/800x400",
    date: "01/01/2025",
    location: "SVĐ Quốc gia, TP.HCM",
    time: "20:00",
    price: "2.000.000đ - 8.000.000đ",
  },
  {
    id: 3,
    title: "Ed Sheeran World Tour 2025",
    image: "https://placehold.co/800x400",
    date: "10/02/2025",
    location: "SVĐ Mỹ Đình, Hà Nội",
    time: "20:00",
    price: "1.000.000đ - 7.500.000đ",
  },
  {
    id: 4,
    title: "Adele Live in Concert",
    image: "https://placehold.co/800x400",
    date: "15/03/2025",
    location: "Nhà hát Lớn, Hà Nội",
    time: "21:00",
    price: "1.500.000đ - 5.000.000đ",
  },
];

// Mock data for Featured Events
const featuredEvents: Event[] = [
  {
    id: 1,
    title: "BTS World Tour 2025",
    image: "https://placehold.co/800x400",
    date: "15/01/2025",
    location: "SVĐ Mỹ Đình, Hà Nội",
    time: "18:00",
    price: "1.000.000đ - 6.500.000đ",
  },
  {
    id: 2,
    title: "The Phantom of the Opera - Broadway Show",
    image: "https://placehold.co/800x400",
    date: "10/02/2025",
    location: "Nhà hát Lớn, Hà Nội",
    time: "20:00",
    price: "800.000đ - 4.000.000đ",
  },
  {
    id: 3,
    title: "The Rolling Stones - Global Tour 2025",
    image: "https://placehold.co/800x400",
    date: "20/02/2025",
    location: "SVĐ Quốc gia, TP.HCM",
    time: "19:00",
    price: "2.000.000đ - 10.000.000đ",
  },
  {
    id: 4,
    title: "Cirque du Soleil - OVO",
    image: "https://placehold.co/800x400",
    date: "25/03/2025",
    location: "Công viên Đầm Sen, TP.HCM",
    time: "18:30",
    price: "400.000đ - 3.500.000đ",
  },
];

// Mock data for Upcoming Events Carousel
const upcomingEvents: Event[] = [
  {
    id: 1,
    title: "NBA All-Star Game 2025",
    image: "https://placehold.co/800x400",
    date: "20/02/2025",
    location: "Sân vận động Hàng Đẫy, Hà Nội",
    time: "19:30",
    price: "500.000đ - 3.000.000đ",
  },
  {
    id: 2,
    title: "Katy Perry Las Vegas Residency",
    image: "https://placehold.co/800x400",
    date: "25/03/2025",
    location: "MGM Grand, Las Vegas",
    time: "21:00",
    price: "1.000.000đ - 5.000.000đ",
  },
  {
    id: 3,
    title: "U2 - The Joshua Tree Tour 2025",
    image: "https://placehold.co/800x400",
    date: "05/04/2025",
    location: "SVĐ Mỹ Đình, Hà Nội",
    time: "20:00",
    price: "1.500.000đ - 7.000.000đ",
  },
  {
    id: 4,
    title: "Shakira World Tour 2025",
    image: "https://placehold.co/800x400",
    date: "15/05/2025",
    location: "SVĐ Quốc gia, TP.HCM",
    time: "19:30",
    price: "1.000.000đ - 6.000.000đ",
  },
];

const categories: Category[] = [
  {id: 1, name: "Âm nhạc", count: 42},
  {id: 2, name: "Phim", count: 28},
  {id: 3, name: "Thể thao", count: 15},
  {id: 4, name: "Sân khấu", count: 23},
  {id: 5, name: "Lễ hội", count: 18},
  {id: 6, name: "Hội thảo", count: 11},
  {id: 7, name: "Trải nghiệm", count: 8},
  {id: 8, name: "Giải trí", count: 35},
];

const venues: Venue[] = [
  {
    id: 1,
    name: "SVĐ Mỹ Đình",
    image: "https://placehold.co/400x300",
    location: "Hà Nội",
    eventCount: 15
  },
  {
    id: 2,
    name: "Khu tổ chức sự kiện Bà Nà Hill",
    image: "https://placehold.co/400x300",
    location: "Đà Nẵng",
    eventCount: 10
  },
  {
    id: 3,
    name: "Grand Park Quận 9",
    image: "https://placehold.co/400x300",
    location: "TP. Hồ Chí Minh",
    eventCount: 21
  },
  {
    id: 4,
    name: "SVD Lạch Ray",
    image: "https://placehold.co/400x300",
    location: "Hải Phòng",
    eventCount: 21
  },
];

  const HomePage = () => {
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);


    const EventCard: React.FC<EventCardProps> = ({event, loading}) => {
      if (loading) {
        return (
          <Card className="w-full">
            <CardHeader className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg"/>
              <Skeleton className="h-4 w-3/4"/>
              <Skeleton className="h-4 w-1/2"/>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full"/>
              <Skeleton className="h-4 w-full"/>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="group cursor-pointer w-full hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4"/>
                <span>{event.date}</span>
                <Clock className="w-4 h-4 ml-2"/>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4"/>
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <div className="font-medium text-primary">{event.price}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full group-hover:bg-primary/90" variant="default">
              <span>Mua vé ngay</span>
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </CardFooter>
        </Card>
      );
    };

    const VenueCard = ({venue}: { venue: Venue }) => {
      return (
        <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2 group-hover:text-primary">{venue.name}</CardTitle>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4"/>
                <span>{venue.location}</span>
              </div>
              <span>{venue.eventCount} sự kiện</span>
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="container max-w-screen-xl mx-auto px-4 space-y-16">
          <section className="relative mb-12">
          <Carousel
            className="w-full"
            opts={{
              loop: true,
              align: "start",
              containScroll: "trimSnaps"
            }}
          >
            <CarouselContent className="-ml-4 flex">
              {heroCarouselEvents.map((event) => (
                <CarouselItem
                  key={event.id}
                  // Thay đổi từ basis-1/2 thành responsive
                  className="pl-4 md:basis-full lg:basis-1/2 min-w-0"
                >
                  <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {/* Điều chỉnh gradient để rõ hơn */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent"/>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <div className="max-w-screen-xl mx-auto">
                        <h2 className="text-xl sm:text-1xl md:text-1xl lg:text-1xl font-bold mb-2 line-clamp-2">
                          {event.title}
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4"/>
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4"/>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
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
            {/* Điều chỉnh vị trí và style của nút điều hướng */}
            <CarouselPrevious/>
            <CarouselNext/>
          </Carousel>
        </section>
          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Danh mục</h2>
              <Button variant="ghost" className="text-primary">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2"/>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="group hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      {category.count} sự kiện
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Popular Venues */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Địa điểm phổ biến</h2>
              <Button variant="ghost" className="text-primary">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2"/>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue}/>
              ))}
            </div>
          </section>

          {/* Featured Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Sự kiện nổi bật</h2>
              <Button variant="ghost" className="text-primary">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2"/>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} loading={loading}/>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Sắp diễn ra</h2>
              <Button variant="ghost" className="text-primary">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2"/>
              </Button>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {upcomingEvents.map((event) => (
                  <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <EventCard event={event} loading={loading}/>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious/>
              <CarouselNext/>
            </Carousel>
          </section>
        </div>
      </div>
    );
  };

  export default HomePage;