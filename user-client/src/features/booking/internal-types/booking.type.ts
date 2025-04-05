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
    recipient?: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
    };
}

// New interface for payment details returned by the server
export interface PaymentDetails {
    soTien: number;
    noiDung: string;
    status: string;
    paymentId: string; // Được sử dụng cho kết nối WebSocket
    soTaiKhoan?: string; // Optional vì có thể chưa được lấy từ API thứ hai
    nganHang?: string;   // Optional vì có thể chưa được lấy từ API thứ hai
}

import { UserProfileCard } from '@/features/setting/internal-types/settings.types';