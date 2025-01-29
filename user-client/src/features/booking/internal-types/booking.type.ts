export interface ShowTime {
    date: string;
    time: string;
}

export interface TicketType {
    type: string;
    price: string;
    available: number;
}

export interface OccaBookingInfo {
    id: string;
    title: string;
    location: string;
    address: string;
    duration: string;
    shows: OccaShowUnit[];
}

export interface OccaShowUnit {
    date: string;
    time: string;
    prices: TicketType[];
}

export interface BookingState {
    selectedShow: ShowTime | null;
    selectedTickets: {
        type: string;
        quantity: number;
        price: string;
    }[];
    totalAmount: number;
}