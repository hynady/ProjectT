import { BaseService } from "@/commons/base.service";
import { OccaBookingInfo } from "../internal-types/booking.type";
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
        return this.request({
            method: 'GET',
            url: `/booking/occa/${occaId}`,
            mockResponse: () => new Promise((resolve) => {
                setTimeout(() => resolve(bookingMockData.occaInfo), 1000);
            })
        });
    }

    async createBooking(bookingData: any): Promise<{ bookingId: string }> {
        return this.request({
            method: 'POST',
            url: '/booking',
            data: bookingData,
            mockResponse: () => new Promise((resolve) => {
                setTimeout(() => resolve({ bookingId: crypto.randomUUID() }), 1000);
            })
        });
    }
}

export const bookingService = BookingService.getInstance();