import { BaseService } from "@/commons/base.service";
import { OccaBookingInfo, OccaShowUnit, BookingPayload } from "../internal-types/booking.type";
import { bookingMockData } from "./booking.mock";

// Cập nhật các interface theo cấu trúc mới của API
export interface LockBookingResponse {
    soTien: number;
    noiDung: string;
    status: string;
    paymentId: string;
}

export interface PaymentInfoResponse {
    soTaiKhoan: string;
    nganHang: string;
}

// Kết hợp cả hai response để tương thích với code hiện tại
export interface PaymentDetails extends LockBookingResponse, PaymentInfoResponse {}

class BookingService extends BaseService {

private static instance: BookingService;

    private constructor() {
        super();
    }

    public static getInstance(): BookingService {
        if (!BookingService.instance) {
            BookingService.instance = new BookingService();
        }
        return BookingService.instance;
    }

    async getOccaBookingInfo(occaId: string): Promise<OccaBookingInfo> {
        // Get occa basic info using omit to eject shows from response
        const occaResponse = await this.request<Omit<OccaBookingInfo, 'shows'>>({
            method: 'GET',
            url: `/occa/forbooking/${occaId}`,
            mockResponse: () => new Promise((resolve) => {
                setTimeout(() => resolve(bookingMockData.occaInfo), 1000);
            })
        });
    
        // Get shows info
        const bookingResponse = await this.request<OccaShowUnit[]>({
            method: 'GET',
            url: `/shows/${occaId}`,
            mockResponse: () => new Promise((resolve) => {
                setTimeout(() => resolve(bookingMockData.showsInfo.shows), 1000);
            })
        });
    
        // Combine responses
        const response: OccaBookingInfo = {
            ...occaResponse,
            shows: bookingResponse
        };
        
        console.log('response', response);
    
        return response;
    }

    // Bước 1: Khóa vé và nhận thông tin cơ bản về thanh toán
    async lockTickets(payload: BookingPayload): Promise<LockBookingResponse> {
        return this.request({
            method: 'POST',
            url: '/booking/lock',
            data: payload,
            mockResponse: () => new Promise((resolve, reject) => {
                // Randomly simulate availability issues (20% chance of failure)
                if (Math.random() < 0.2) {
                    setTimeout(() => reject(new Error("Vé đã hết hoặc đã được đặt bởi người khác")), 800);
                    return;
                }
                
                // Generate a unique payment ID for WebSocket connection
                const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                
                setTimeout(() => resolve({
                    soTien: payload.tickets.reduce((total, ticket) => {
                        // Mock calculation - would be more precise in real API
                        return total + (ticket.quantity * 200000);
                    }, 0),
                    noiDung: `TICKET${Math.floor(Math.random() * 1000000)}`,
                    status: "waiting_payment",
                    paymentId: paymentId
                }), 1000);
            })
        });
    }

    // Bước 2: Lấy thông tin tài khoản ngân hàng để chuyển khoản
    async getPaymentInfo(paymentId: string): Promise<PaymentInfoResponse> {
        return this.request({
            method: 'GET',
            url: `/payment/info/${paymentId}`,
            mockResponse: () => new Promise((resolve) => {
                setTimeout(() => resolve({
                    soTaiKhoan: "1234567890",
                    nganHang: "TECHCOMBANK"
                }), 500);
            })
        });
    }

    // Phương thức để lấy đầy đủ thông tin thanh toán (kết hợp cả hai API)
    async getFullPaymentDetails(payload: BookingPayload): Promise<PaymentDetails> {
        // Bước 1: Khóa vé
        const lockResponse = await this.lockTickets(payload);
        
        // Bước 2: Lấy thông tin tài khoản ngân hàng
        const paymentInfo = await this.getPaymentInfo(lockResponse.paymentId);
        
        // Kết hợp cả hai kết quả
        return {
            ...lockResponse,
            ...paymentInfo
        };
    }
}

export const bookingService = BookingService.getInstance();