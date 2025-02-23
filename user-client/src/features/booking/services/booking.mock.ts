import { OccaBookingInfo } from '../internal-types/booking.type';

export const bookingMockData = {
    occaInfo: {
        id: "1",
        title: "LIVE CONCERT 2025 - THE HARMONY",
        location: "Nhà hát Hòa Bình",
        address: "240-242 Đường 3/2, Phường 12, Quận 10, TP.HCM",
        duration: "120 phút",
        shows: [
            {
                date: '2025-01-20',
                time: '19:00',
                prices: [
                  { type: 'Hạng VIP', price: 2000000, available: 50 },
                  { type: 'Hạng Thường', price: 1000000, available: 100 },
                  { type: 'Hạng Phổ thông', price: 500000, available: 200 },
                ],
              },
              {
                date: '2025-01-20',
                time: '21:00',
                prices: [
                  { type: 'Hạng VIP', price: 2000000, available: 50 },
                  { type: 'Hạng Thường', price: 1000000, available: 100 },
                  { type: 'Hạng Phổ thông', price: 500000, available: 200 },
                ],
              },
              {
                date: '2025-01-21',
                time: '19:00',
                prices: [
                  { type: 'Hạng VIP', price: 2000000, available: 50 },
                  { type: 'Hạng Thường', price: 1000000, available: 100 },
                  { type: 'Hạng Phổ thông', price: 500000, available: 200 },
                ],
              },
        ]
    } as OccaBookingInfo
};