import { BaseService } from "@/commons/base.service";
import { OccaBookingInfo, OccaShowUnit, BookingResponse, BookingPayload, PaymentDetails } from "../internal-types/booking.type";
import { bookingMockData } from "./booking.mock";

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

    async createBooking(payload: BookingPayload): Promise<BookingResponse> {
        return this.request({
            method: 'POST',
            url: '/booking',
            data: payload,
            mockResponse: () => new Promise((resolve) => {
                setTimeout(() => resolve({ status: "success" }), 1000);
            })
        });
    }

    // Method for locking tickets and getting payment details
    async lockTickets(payload: BookingPayload): Promise<PaymentDetails> {
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
                    soTaiKhoan: "1234567890",
                    nganHang: "TECHCOMBANK",
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
}

export const bookingService = BookingService.getInstance();