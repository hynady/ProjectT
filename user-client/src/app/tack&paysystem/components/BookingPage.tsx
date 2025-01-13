// src/pages/booking/BookingPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {EventDetail as Event, ShowDetail} from "@/types";
import {BookingLayout} from "@/app/tack&paysystem/BookingLayout.tsx";
import {SelectShow} from "@/app/tack&paysystem/components/SelectShow.tsx";
import {SelectSeats} from "@/app/tack&paysystem/components/SelectSeats.tsx";
import {SelectTickets} from "@/app/tack&paysystem/components/SelectTickets.tsx";


export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    showId: '',
    seats: [] as string[],
    tickets: [] as { type: string; quantity: number }[],
  });

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
            date: "15 tháng 01, 2025",
            time: "20:00",
            duration: "150 phút",
            trackSeats: true,
            prices: [
              {
                type: "SVIP",
                price: 3500000,
                available: 20,
                seats: [
                  { id: "SVIP-A1", status: "available", row: "A", number: "1" },
                  { id: "SVIP-A2", status: "available", row: "A", number: "2" },
                  { id: "SVIP-B1", status: "booked", row: "B", number: "1" },
                ]
              },
              {
                type: "VIP",
                price: 2500000,
                available: 50,
                seats: [
                  { id: "VIP-C1", status: "available", row: "C", number: "1" },
                  { id: "VIP-C2", status: "available", row: "C", number: "2" },
                ]
              },
              {
                type: "Standard",
                price: 1500000,
                available: 100,
                seats: [
                  { id: "STD-D1", status: "available", row: "D", number: "1" },
                  { id: "STD-D2", status: "booked", row: "D", number: "2" },
                ]
              },
            ]
          },
          {
            id: "show-2",
            date: "16 tháng 01, 2025",
            time: "20:00",
            duration: "150 phút",
            trackSeats: false,
            prices: [
              {
                type: "SVIP Package",
                price: 3500000,
                available: 15,
                description: "Bao gồm: Vị trí đẹp nhất + Meet & Greet + Poster có chữ ký",
                benefits: [
                  "Vị trí xem đẹp nhất",
                  "Gặp gỡ nghệ sĩ",
                  "Poster có chữ ký",
                  "Quà tặng độc quyền"
                ]
              },
              {
                type: "VIP Package",
                price: 2500000,
                available: 45,
                description: "Bao gồm: Vị trí VIP + Poster có chữ ký",
                benefits: [
                  "Vị trí VIP",
                  "Poster có chữ ký",
                  "Quà tặng đặc biệt"
                ]
              },
              {
                type: "Standard Package",
                price: 1500000,
                available: 90,
                description: "Vé xem concert tiêu chuẩn",
                benefits: [
                  "Vị trí đẹp",
                  "Quà tặng lưu niệm"
                ]
              },
            ]
          },
          {
            id: "show-3",
            date: "17 tháng 01, 2025",
            time: "20:00",
            duration: "150 phút",
            trackSeats: true,
            prices: [
              {
                type: "SVIP",
                price: 3500000,
                available: 20,
                seats: [
                  { id: "SVIP-A1", status: "available", row: "A", number: "1" },
                  { id: "SVIP-A2", status: "available", row: "A", number: "2" },
                ]
              },
              {
                type: "VIP",
                price: 2500000,
                available: 50,
                seats: [
                  { id: "VIP-C1", status: "available", row: "C", number: "1" },
                  { id: "VIP-C2", status: "available", row: "C", number: "2" },
                ]
              },
              {
                type: "Standard",
                price: 1500000,
                available: 100,
                seats: [
                  { id: "STD-D1", status: "available", row: "D", number: "1" },
                  { id: "STD-D2", status: "available", row: "D", number: "2" },
                ]
              }
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
        ],
        trackSeats: true,
      };
      setEvent(eventData);
      setLoading(false);
    };

    fetchEvent();
  }, [id, navigate]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Handle booking completion
      console.log('Booking completed:', bookingData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(`/events/${id}`);
    }
  };

  const getCurrentShow = (): ShowDetail | undefined => {
    return event?.shows.find(show => show.id === bookingData.showId);
  };

  const isNextDisabled = () => {
    const currentShow = getCurrentShow();
    if (!currentShow) return true;

    switch (currentStep) {
      case 1:
        return !bookingData.showId;
      case 2:
        return event?.trackSeats
          ? bookingData.seats.length === 0
          : !bookingData.tickets.some(t => t.quantity > 0);
      default:
        return false;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <BookingLayout
      currentStep={currentStep}
      totalSteps={3}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isNextDisabled={isNextDisabled()}
    >
      {currentStep === 1 && (
        <SelectShow
          event={event}
          onSelectShow={(showId) => setBookingData(prev => ({ ...prev, showId }))}
        />
      )}
      {currentStep === 2 && getCurrentShow() && (
        event.trackSeats ? (
          <SelectSeats
            show={getCurrentShow()!}
            onSelectSeats={(seats) => setBookingData(prev => ({ ...prev, seats }))}
          />
        ) : (
          <SelectTickets
            show={getCurrentShow()!}
            onSelectTickets={(tickets) => setBookingData(prev => ({ ...prev, tickets }))}
          />
        )
      )}
      {currentStep === 3 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Thanh toán</h2>
          {/* Add payment component here */}
        </div>
      )}
    </BookingLayout>
  );
}