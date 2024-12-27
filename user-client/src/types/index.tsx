// src/types/index.ts
export interface EventData {  // Đổi tên từ Event sang EventData
  id: number;
  title: string;
  image: string;
  date: string;
  location: string;
  time: string;
  price: string;
}

export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface Venue {
  id: number;
  name: string;
  image: string;
  location: string;
  eventCount: number;
}