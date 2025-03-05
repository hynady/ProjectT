export interface Ticket {
  id: string;
  checkedInAt: string | null;
}

export interface Occa {
  id: string;
  title: string;
  location: string;
}

export interface Show {
  id: string;
  date: string;
  time: string;
}

export interface TicketType {
  id: string;
  type: string;
  price: number;
}

export interface TicketDisplayUnit {
  ticket: Ticket;
  occa: Occa;
  show: Show;
  ticketType: TicketType;
}