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