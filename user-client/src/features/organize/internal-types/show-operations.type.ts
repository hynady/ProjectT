import { ShowSaleStatus } from "./organize.type";

// Types for Show operations
export interface AddShowPayload {
  date: string;
  time: string;
  saleStatus: ShowSaleStatus;
  autoUpdateStatus: boolean;
}

export interface UpdateShowPayload {
  date?: string;
  time?: string;
  saleStatus?: ShowSaleStatus;
  autoUpdateStatus?: boolean;
}

// Types for Ticket operations
export interface AddTicketPayload {
  type: string;
  price: number;
  availableQuantity: number;
}

export interface UpdateTicketPayload {
  type?: string;
  price?: number;
  availableQuantity?: number;
}

export interface TicketResponse {
  id: string;
  type: string;
  price: number;
  available: number;
}