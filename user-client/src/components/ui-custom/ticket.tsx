// import { CalendarDays, MapPin } from 'lucide-react';
//
// const EventTicket = () => {
//   return (
//     <div className="relative max-w-4xl bg-zinc-900 rounded-lg overflow-hidden">
//       <div className="flex flex-col md:flex-row relative">
//         {/* Left side ticket info */}
//         <div className="p-6 space-y-4 flex-1">
//           <h1 className="text-2xl md:text-3xl font-bold text-white">
//             SÀI GÒN SIMPLE LOVE 2025
//           </h1>
//
//           <div className="flex items-center text-emerald-400 space-x-2">
//             <CalendarDays className="w-5 h-5" />
//             <span>18:00 - 23:00, 15 Tháng 02, 2025</span>
//           </div>
//
//           <div className="flex items-start space-x-2">
//             <MapPin className="w-5 h-5 text-emerald-400 mt-1" />
//             <div className="text-gray-300">
//               <div className="font-medium">Vạn Phúc City</div>
//               <div className="text-sm">
//                 375 Quốc lộ 13, Khu phố 5, Phường Hiệp Bình Phước, Quận Thủ Đức, Thành Phố Hồ Chí Minh
//               </div>
//             </div>
//           </div>
//
//           <div className="pt-4 border-t border-zinc-700">
//             <div className="text-gray-400">Giá từ</div>
//             <div className="text-2xl font-bold text-emerald-400">
//               1.000.000 đ
//             </div>
//           </div>
//
//           <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
//             Mua vé ngay
//           </button>
//         </div>
//
//         {/* Divider with notches */}
//         <div className="hidden md:block relative">
//           {/* Top notch */}
//           <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full z-50" />
//
//           {/* Bottom notch */}
//           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full z-50" />
//
//           {/* Vertical dotted line */}
//           <div className="h-full border-l-4 border-dashed border-zinc-700" />
//         </div>
//
//         {/* Right side event image */}
//         <div className="relative w-full md:w-2/3 aspect-[16/9] md:aspect-auto">
//           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-900/30">
//             <div className="w-full h-full bg-[url('/api/placeholder/800/600')] bg-cover bg-center opacity-90">
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="text-center space-y-2">
//                   <div className="text-6xl font-bold text-white drop-shadow-lg">
//                     15.02
//                   </div>
//                   <div className="text-4xl font-bold text-white drop-shadow-lg">
//                     2025
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default EventTicket;

/// src/pages/EventDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  Users,
  Info,
  FileText,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    // Fetch dữ liệu sự kiện từ API dựa trên ID
    const fetchEvent = async () => {
      // Giả lập fetch từ API
      const eventData = {
        id: id,
        title: "The Artificial Paradise Tour 2025",
        artist: "BlackPink",
        description: "Đêm nhạc đặc biệt với những ca khúc hit được yêu thích nhất",
        bannerUrl: "https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg",
        date: "15/01/2025",
        time: "20:00",
        duration: "150",
        location: "Nhà hát Hòa Bình",
        address: "240-242 3/2, Q.10, TP.HCM",
        organizer: "Dream Maker Entertainment",
        prices: [
          { type: "SVIP", price: 3500000, available: 20 },
          { type: "VIP", price: 2500000, available: 50 },
          { type: "Standard", price: 1500000, available: 100 },
          { type: "Economy", price: 800000, available: 200 },
        ],
        highlights: [
          "Live performance với dàn nhạc full band",
          "Giao lưu cùng nghệ sĩ",
          "Quà tặng đặc biệt cho khán giả",
          "Photo opportunity với nghệ sĩ (SVIP)",
          "Soundcheck party (VIP & SVIP)",
        ],
        details: `Chương trình concert hoành tráng nhất năm 2025...
                  [Chi tiết nội dung concert]`,
        terms: [
          "Vé đã mua không được đổi hoặc hoàn tiền",
          "Vui lòng đến trước giờ diễn 30 phút",
          "Không sử dụng máy ảnh chuyên nghiệp",
          "Tuân thủ quy định của ban tổ chức",
        ],
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
          "https://example.com/image3.jpg",
        ],
        coordinates: {
          lat: 10.762622,
          lng: 106.660172
        }
      };

      setEvent(eventData);
    };

    fetchEvent();
  }, [id, navigate]);

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background py-6">
      {/* Hero Section */}
      <div className="relative h-[80vh]">
        <div className="absolute inset-0">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className="bg-primary">Hot</Badge>
                  <Badge variant="outline">Music</Badge>
                  <Badge variant="outline">Concert</Badge>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold  leading-tight">
                  {event.title}
                </h1>

                <p className="text-2xl text-muted-foreground">{event.artist}</p>

                <div className="flex flex-wrap gap-6 text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{event.time} ({event.duration} phút)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="overview" className="flex gap-2">
                  <Info className="h-4 w-4" />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="details" className="flex gap-2">
                  <FileText className="h-4 w-4" />
                  Chi tiết
                </TabsTrigger>
                <TabsTrigger value="terms" className="flex gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Điều khoản
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-8">
                  {/* Highlights */}
                  <div className="bg-card rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Điểm nổi bật
                    </h2>
                    <ul className="space-y-3">
                      {event.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-3 text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Organizer */}
                  <div className="bg-card rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Nhà tổ chức
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                      <div>
                        <h3 className="text-primary font-medium">{event.organizer}</h3>
                        <p className="text-muted-foreground text-sm">Đơn vị tổ chức sự kiện</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="bg-card rounded-xl p-6">
                  <div className="prose prose-invert max-w-none">
                    {event.details}
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
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Chọn vé</h2>
                <div className="space-y-4">
                  {event.prices.map((ticket, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-muted rounded-lg hover:border-primary transition-colors"
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
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6" size="lg">
                  Đặt vé ngay
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Vé được bán bởi {event.organizer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <section className="bg-card rounded-xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Địa điểm tổ chức
          </h2>
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src={"https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=10.7878089,106.698925&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"}
                width="100%"
                height="100%"
                style={{border: 0}}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-primary">{event.location}</h3>
              <p className="text-muted-foreground">{event.address}</p>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Hình ảnh sự kiện</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.images.map((image, index) => (
              <div
                key={index}
                className="aspect-[4/3] relative rounded-lg overflow-hidden group cursor-pointer"
              >
                <img
                  src={image}
                  alt={`Event image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Làm thế nào để đặt vé?</AccordionTrigger>
                <AccordionContent>
                  Bạn có thể đặt vé trực tiếp trên website bằng cách chọn loại vé mong muốn và thực hiện thanh toán online.
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
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Sự kiện liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3">
                  <img
                    src={`https://picsum.photos/400/600?random=${item}`}
                    alt="Related event"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-medium text-primary group-hover:text-primary transition-colors">
                  Event Title {item}
                </h3>
                <p className="text-sm text-muted-foreground">15 Jan 2025</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-muted p-4 lg:hidden">
          <div className="container flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Giá từ</p>
              <p className="text-xl font-semibold text-primary">
                {Math.min(...event.prices.map(p => p.price)).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <Button size="lg" className="flex-1">
              Đặt vé ngay
            </Button>
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Share2 className="h-5 w-5" />
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
              <Facebook className="h-5 w-5" />
              <span className="text-sm">Facebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Twitter className="h-5 w-5" />
              <span className="text-sm">Twitter</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Message</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <LinkIcon className="h-5 w-5" />
              <span className="text-sm">Copy Link</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Thêm các components cần thiết từ shadcn/ui
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Thêm các icons từ lucide-react
import {
  Facebook,
  Twitter,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";

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
  prices: {
    type: string;
    price: number;
    available: number;
  }[];
  highlights: string[];
  details: string;
  terms: string[];
  images: string[];
  coordinates: {
    lat: number,
    lng: number
  }
}