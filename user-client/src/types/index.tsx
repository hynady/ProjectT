export interface EventData {
  id: string;
  title: string;
  image: string;
  date: string;
  categoryId: string;
  location: string;
  venueId: string;
  time: string;
  price: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Venue {
  id: string;
  name: string;
  image: string;
  location: string;
  eventCount: number;
}

export interface EventSection {
  title: string;
  events: EventData[];
}

export interface EventDetail {
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
  shows: ShowDetail[];
  highlights: string[];
  details: string;
  terms: string[];
  images: string[];
  trackSeats?: boolean; // Thêm trường này để xác định có chọn ghế hay không
}

export interface ShowDetail {
  id: string;
  date: string;
  time: string;
  duration: string;
  prices: TicketPrice[];
  seats?: SeatSection[]; // Thêm thông tin ghế nếu trackSeats = true
}

export interface TicketPrice {
  type: string;
  price: number;
  available: number;
}

export interface SeatSection {
  id: string;
  name: string;
  price: number;
  rows: SeatRow[];
}

export interface SeatRow {
  id: string;
  name: string;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string;
  status: 'available' | 'reserved' | 'sold';
  price: number;
}