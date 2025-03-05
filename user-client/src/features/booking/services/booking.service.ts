import { BaseService } from "@/commons/base.service";
import { OccaBookingInfo, OccaShowUnit, BookingResponse, BookingPayload } from "../internal-types/booking.type";
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
}

export const bookingService = BookingService.getInstance();