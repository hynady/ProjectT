// Mock data for booking service
export const bookingMockData = {
    occaInfo: {
        id: "1",
        title: "LIVE CONCERT 2025 - THE HARMONY",
        location: "Nhà hát Hòa Bình",
        address: "240-242 Đường 3/2, Phường 12, Quận 10, TP.HCM",
        duration: "120 phút"
    },
    showsInfo: {
        shows: [
            {
                id: '1',
                date: '2025-01-20',
                time: '19:00',
                prices: [
                    { id: '1', type: 'Hạng VIP', price: 2000000, available: 50 },
                    { id: '2', type: 'Hạng Thường', price: 1000000, available: 100 },
                    { id: '3', type: 'Hạng Phổ thông', price: 500000, available: 200 },
                ]
            },
            {
                id: '2',
                date: '2025-01-20',
                time: '21:00',
                prices: [
                  { id: '1', type: 'Hạng VIP', price: 2000000, available: 50 },
                  { id: '2', type: 'Hạng Thường', price: 1000000, available: 100 },
                  { id: '3', type: 'Hạng Phổ thông', price: 500000, available: 200 },
                ],
              },
              {
                id: '3',
                date: '2025-01-21',
                time: '19:00',
                prices: [
                  { id: '1', type: 'Hạng VIP', price: 2000000, available: 50 },
                  { id: '2', type: 'Hạng Thường', price: 1000000, available: 100 },
                  { id: '3', type: 'Hạng Phổ thông', price: 500000, available: 200 },
                ],
              },
        ]
    }
};