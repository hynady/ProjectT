import {useParams, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  Users,
  Info,
  FileText,
  ShieldCheck, ImageIcon, ArrowRight
} from 'lucide-react';
import {Button} from '@/components/ui/button.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs.tsx';

export default function EventDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    // Fetch dữ liệu sự kiện từ API dựa trên ID
    const fetchEvent = async () => {
      // Giả lập fetch từ API
      setLoading(true);
      const eventData = {
        id: id,
        title: "The Artificial Paradise Tour 2025",
        artist: "BlackPink",
        description: "Đêm nhạc đặc biệt với những ca khúc hit được yêu thích nhất",
        bannerUrl: "https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg",
        date: "15/01/2025-17/01/2025",
        time: "20:00",
        duration: "150",
        location: "Sân vận động việt trì",
        address: "Đ. Hùng Vương, Ph.Thọ Sơn, Việt Trì, Phú Thọ",
        organizer: "Dream Maker Entertainment",
        highlights: [
          "Live performance với dàn nhạc full band",
          "Giao lưu cùng nghệ sĩ",
          "Quà tặng đặc biệt cho khán giả",
          "Photo opportunity với nghệ sĩ (SVIP)",
          "Soundcheck party (VIP & SVIP)",
        ],
        shows: [
          {
            id: "show-1",
            date: "15/01/2025",
            time: "20:00",
            duration: "150",
            prices: [
              {type: "SVIP", price: 3500000, available: 20},
              {type: "VIP", price: 2500000, available: 50},
              {type: "Standard", price: 1500000, available: 100},
              {type: "Economy", price: 800000, available: 200},
            ]
          },
          {
            id: "show-2", 
            date: "16/01/2025",
            time: "20:00",
            duration: "150",
            prices: [
              {type: "SVIP", price: 3500000, available: 15},
              {type: "VIP", price: 2500000, available: 45},
              {type: "Standard", price: 1500000, available: 90},
              {type: "Economy", price: 800000, available: 180},
            ]
          },
          {
            id: "show-3",
            date: "17/01/2025", 
            time: "20:00",
            duration: "150",
            prices: [
              {type: "SVIP", price: 3500000, available: 20},
              {type: "VIP", price: 2500000, available: 50},
              {type: "Standard", price: 1500000, available: 100},
              {type: "Economy", price: 800000, available: 200},
            ]
          }
        ],
        details: `# The Artificial Paradise Tour 2025
![The Artificial Paradise Tour 2025](https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg)

### Event Description
Join us for a special music night with BlackPink, featuring their most popular hit songs. Experience the thrill of live performances with a full band, meet the artists, and enjoy exclusive fan experiences.

### Ticket Prices
- **SVIP**: 3,500,000 VND (Available: 20)
- **VIP**: 2,500,000 VND (Available: 50)
- **Standard**: 1,500,000 VND (Available: 100)
- **Economy**: 800,000 VND (Available: 200)

### Event Highlights
- Live performance with a full band
- Meet and greet with the artists
- Special gifts for the audience
- Photo opportunity with the artists (SVIP)
- Soundcheck party (VIP & SVIP)

### Terms and Conditions
- Tickets are non-refundable and non-exchangeable
- Please arrive 30 minutes before the performance
- Professional cameras are not allowed
- Follow the event organizer's regulations
`,
        terms: [
          "Vé đã mua không được đổi hoặc hoàn tiền",
          "Vui lòng đến trước giờ diễn 30 phút",
          "Không sử dụng máy ảnh chuyên nghiệp", 
          "Tuân thủ quy định của ban tổ chức"
        ],
        images: [
          "https://i.pinimg.com/564x/95/c0/57/95c0575449ca70f8487ffcf3e586bfa9.jpg",
          "https://i.pinimg.com/564x/25/c4/94/25c494b3f3b15de57162f11ce5d1b94d.jpg",
          "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
          "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
          "https://i.pinimg.com/564x/2c/06/47/2c064739aa03e5e0564e877d955f1df7.jpg",
        ]
      };
      setEvent(eventData);
      setLoading(false);
    };


    setTimeout(() => fetchEvent(), 1000);
  }, [id, navigate]);

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (!event) return null;
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
    <div className="min-h-screen bg-background py-6">
      {/* Hero Section */}
      <div className="relative h-[80vh]">
        <div className="absolute inset-0 animate-fade-down animate-ease-in-out">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"/>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-8">
          <div className="container mx-auto max-w-6xl">
            <Card
              className="animate-fade-up animate-ease-in-out p-6 flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:justify-between lg:items-end lg:space-y-0 lg:gap-6">
              {/* Left Content */}
              <div className="space-y-2 sm:space-y-4">
                {/* Badges - Ẩn trên mobile */}
                <div className="hidden sm:flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge
                    variant="default"
                    className="bg-primary dark:bg-primary text-xs sm:text-sm"
                  >
                    Hot
                  </Badge>
                  <Badge variant="default" className="text-xs sm:text-sm">Music</Badge>
                  <Badge variant="default" className="text-xs sm:text-sm">Concert</Badge>
                </div>

                {/* Title - Luôn hiển thị */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  {event.title}
                </h1>

                {/* Artist - Ẩn trên mobile */}
                <p className=" sm:block text-lg sm:text-xl md:text-2xl text-muted-foreground">
                  {event.artist}
                </p>

                {/* Event Details - Ẩn trên mobile */}
                <div
                  className="hidden sm:flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 md:gap-6 text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary"/>
                    <span className="text-xs sm:text-sm md:text-base">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary"/>
                    <span className="text-xs sm:text-sm md:text-base">
                      {event.time} ({event.duration} phút)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary"/>
                    <span className="text-xs sm:text-sm md:text-base">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Action Buttons - Ẩn trên mobile */}
              <div className="hidden sm:flex gap-2 sm:gap-4 justify-start sm:justify-end">
                {/* Share Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                    >
                      <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"/>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chia sẻ sự kiện</DialogTitle>
                      <DialogDescription>
                        Chia sẻ sự kiện này với bạn bè của bạn qua các kênh sau
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4 py-4">
                      <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                        <Facebook className="h-5 w-5"/>
                        <span className="text-sm">Facebook</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                        <Twitter className="h-5 w-5"/>
                        <span className="text-sm">Twitter</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                        <MessageCircle className="h-5 w-5"/>
                        <span className="text-sm">Message</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                        <LinkIcon className="h-5 w-5"/>
                        <span className="text-sm">Copy Link</span>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"/>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-12 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8 ">
                <TabsTrigger value="overview" className="flex gap-2">
                  <Info className="h-4 w-4"/>
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="details" className="flex gap-2">
                  <FileText className="h-4 w-4"/>
                  Chi tiết
                </TabsTrigger>
                <TabsTrigger value="terms" className="flex gap-2">
                  <ShieldCheck className="h-4 w-4"/>
                  Điều khoản
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-8">
                  {/* Overview */}
                  <Card className="prose prose-invert max-w-none p-6 transition-colors">
                    <MarkdownContent content={event.details}/>
                  </Card>
                  {/* Organizer */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500"/>
                      Nhà tổ chức
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"/>
                      <div>
                        <h3 className="text-primary font-medium">{event.organizer}</h3>
                        <p className="text-muted-foreground text-sm">Đơn vị tổ chức sự kiện</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="bg-card rounded-xl p-6">
                  <div className="prose prose-invert max-w-none">
                    <MarkdownContent content={event.details}/>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms">
                <div className="bg-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-card-foreground mb-4">
                    Điều khoản & Điều kiện
                  </h2>
                  <ul className="space-y-3">
                    {event.terms.map((term, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-primary"/>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Ticket Selection */}
          {/* Right Sidebar - Show Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Chọn buổi diễn</h2>
                <Accordion type="single" collapsible>
                  {event.shows.map((show, index) => (
                    <AccordionItem key={index} value={`show-${index}`}>
                      <AccordionTrigger>
                        {show.date} - {show.time}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {show.prices.map((ticket, ticketIndex) => (
                            <Card
                              key={ticketIndex}
                              className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                            >
                              <div>
                                <h3 className="font-semibold text-primary">{ticket.type}</h3>
                                <p className="text-muted-foreground">
                                  {ticket.price.toLocaleString('vi-VN')}đ
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Còn {ticket.available} vé
                                </p>
                              </div>
                              <Button>Chọn</Button>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Button className="w-full mt-6" size="lg" onClick={()=>navigate("booking")}>
                  Đặt vé ngay
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Vé được bán bởi {event.organizer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery and Location Section */}
        <Card className="p-4 lg:p-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gallery Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500"/>
                Hình ảnh sự kiện
              </h2>
              <div className="relative w-full">
                <Carousel
                  opts={{
                    align: "start",
                    slidesToScroll: 1,
                    loop: true,
                  }}
                  plugins={[
                    Autoplay({
                      delay: 2000,
                    }),
                  ]}
                  orientation="vertical"
                  className="w-full"
                >
                  <CarouselContent className="h-[300px] sm:h-[400px] lg:h-[500px]">
                    {event.images.map((image, index) => (
                      <CarouselItem key={index} className=" pb-4 basis-full lg:basis-1/2">
                        <Card className="overflow-hidden h-full">
                          <CardContent className="p-0 h-full">
                            <div className="w-full h-full relative">
                              <img
                                src={image}
                                alt={`Event image ${index + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious/>
                  <CarouselNext/>
                </Carousel>
              </div>
            </div>

            {/* Location Section */}
            <section className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500"/>
                Địa điểm tổ chức
              </h2>
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(`${event.location} ${event.address}`)}`}
                    width="100%"
                    height="100%"
                    style={{border: 0}}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <Card className="p-3 space-y-2 cursor-pointer">
                  <h3 className="font-medium text-primary">{event.location}</h3>
                  <p className="text-muted-foreground text-sm">{event.address}</p>
                </Card>
              </div>
            </section>
          </div>
        </Card>

        {/* FAQs Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Làm thế nào để đặt vé?</AccordionTrigger>
                <AccordionContent>
                  Bạn có thể đặt vé trực tiếp trên website bằng cách chọn loại vé mong muốn và thực hiện thanh toán
                  online.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Chính sách đổi/trả vé?</AccordionTrigger>
                <AccordionContent>
                  Vé đã mua không được đổi hoặc hoàn tiền, trừ trường hợp sự kiện bị hủy bởi ban tổ chức.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Có giảm giá cho nhóm không?</AccordionTrigger>
                <AccordionContent>
                  Có ưu đãi đặc biệt cho nhóm từ 10 người trở lên. Vui lòng liên hệ ban tổ chức để biết thêm chi tiết.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Related Events */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
              Có thể bạn sẽ thích</h2>
            <Button variant="ghost" className="text-primary">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </div>
          {renderUpcomingEvents()}
        </section>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-muted p-4 lg:hidden">
          <div className="container flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Giá từ</p>
              <p className="text-xl font-semibold text-primary">
              {Math.min(...event.shows.flatMap(show => show.prices.map(p => p.price))).toLocaleString('vi-VN')}đ              </p>
            </div>
            <Button size="lg" className="flex-1">
              Đặt vé ngay
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Thêm các components cần thiết từ shadcn/ui
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

// Thêm các icons từ lucide-react
import {
  Facebook,
  Twitter,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import MarkdownContent from "@/components/global/MarkdownRenderer.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import Autoplay from "embla-carousel-autoplay";
import {EventCardSkeleton} from "@/app/homepage/components/skeletons/EventCardSkeleton.tsx";
import {EventCard} from "@/app/homepage/components/EventCard.tsx";
import {upcomingEvents} from "@/services/mockData.tsx";
import {EventDetailSkeleton} from "@/app/tack&paysystem/components/eventdetails/skeletons/EventDetailSkeleton.tsx";

// Định nghĩa type Event
interface Event {
  id: string;
  title: string;
  artist: string;
  description: string;
  bannerUrl: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address: string;
  organizer: string;
  shows: {
    id: string;
    date: string;
    time: string;
    duration: string;
    prices: {
      type: string;
      price: number;
      available: number;
    }[];
  }[];
  highlights: string[];
  details: string;
  terms: string[];
  images: string[];
}