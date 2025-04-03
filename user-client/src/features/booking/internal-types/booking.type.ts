export interface ShowTime {
    id: string;
    date: string;
    time: string;
}

export interface TicketType {
    id: string;
    type: string;
    price: number;
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
    id: string;
    date: string;
    time: string;
    prices: TicketType[];
}

export interface BookingState {
    selectedShow: ShowTime | null;
    selectedTickets: {
        id: string;
        type: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    selectedProfile?: UserProfileCard;
}

export interface OccaShortInfo {
    title: string;
    location: string;
    duration: string;
    address: string;
}

export interface BookingResponse {
    status: string;
}

export interface BookingPayload {
    showId: string;
    tickets: {
        id: string;
        type: string;
        quantity: number;
    }[];
}

// New interface for payment details returned by the server
export interface PaymentDetails {
    soTaiKhoan: string;
    nganHang: string;
    soTien: number;
    noiDung: string;
    status: string;
    paymentId: string; // Added for WebSocket connection
}

import { UserProfileCard } from '@/features/setting/internal-types/settings.types';