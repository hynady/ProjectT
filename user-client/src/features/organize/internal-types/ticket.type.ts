export interface TicketInfo {
  ticketId: string;
  ticketType: string;
  ticketPrice: number;
  showId: string;
  showDate: string;
  showTime: string;
  occaTitle: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  checkedInAt: string | null;
  purchasedAt: string;
  invoiceId: string;
  paymentId: string;
}

export interface TicketRevenueByClass {
  ticketClassId: string;
  ticketClassName: string;
  ticketsSold: number;
  totalRevenue: number;
}

export interface TicketListResponse {
  tickets: TicketInfo[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  revenueByTicketClass?: TicketRevenueByClass[];
}

export interface TicketFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  showId?: string;
  startDate?: string;
  endDate?: string;
  ticketType?: string;
  checkedIn?: boolean;
  statusFilter?: 'all' | 'checked-in' | 'not-checked-in';
}
