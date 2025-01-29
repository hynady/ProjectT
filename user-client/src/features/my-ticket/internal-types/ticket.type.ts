export interface TicketBase {
  id: string;
  occaId: string;
  showId: string;
  typeId: string;
  purchaseDate: string;
  qrCode: string;
  purchasedBy: string;
  checkedInAt?: string;
}

export interface OccaBase {
  id: string;
  title: string;
  location: string;
  duration: string;
  address: string;
}

export interface ShowBase {
  id: string;
  occaId: string;
  date: string;
  time: string;
}

export interface TicketTypeBase {
  id: string;
  showId: string;
  type: string;
  price: number;
}

export interface TicketDisplayUnit {
  ticket: TicketBase;
  occa: OccaBase;
  show: ShowBase;
  ticketType: TicketTypeBase;
}