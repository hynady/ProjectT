import {
  GalleryUnit,
  LocationData,
  OccaHeroSectionUnit,
  OccaShowUnit,
  OverviewData,
} from "@/features/detail/internal-types/detail.type.ts";

export const detailMockData = {
  heroData: {
    bannerUrl:
      "https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg",
    title: "The Artificial Paradise Tour 2025",
    artist: "BlackPink",
    date: "2025-01-15",
    time: "20:00",
    duration: "150",
    location: "Sân vận động Việt Trì",
  } as OccaHeroSectionUnit,
  locationData: {
    location: "Sân vận động Việt Trì",
    address: "Đ. Hùng Vương, Ph. Thọ Sơn, Việt Trì, Phú Thọ",
  } as LocationData,
  showsData: [
    {
      id: "1",
      date: "2025-01-20",
      time: "19:00",
      prices: [
        { id: "1", type: "Hạng VIP", price: 2000000, available: 50 },
        { id: "2", type: "Hạng Thường", price: 1000000, available: 100 },
        { id: "3", type: "Hạng Phổ thông", price: 500000, available: 200 },
      ],
    },
    {
      id: "2",
      date: "2025-01-20",
      time: "21:00",
      prices: [
        { id: "4", type: "Hạng VIP", price: 2000000, available: 50 },
        { id: "5", type: "Hạng Thường", price: 1000000, available: 100 },
        { id: "6", type: "Hạng Phổ thông", price: 500000, available: 200 },
      ],
    },
    {
      id: "3",
      date: "2025-01-21",
      time: "19:00",
      prices: [
        { id: "7", type: "Hạng VIP", price: 2000000, available: 50 },
        { id: "8", type: "Hạng Thường", price: 1000000, available: 100 },
        { id: "9",   type: "Hạng Phổ thông", price: 500000, available: 200 },
      ],
    },
  ] as OccaShowUnit[],
  galleryData: [
    {
      image:
        "https://i.pinimg.com/564x/95/c0/57/95c0575449ca70f8487ffcf3e586bfa9.jpg",
    },
    {
      image:
        "https://i.pinimg.com/564x/25/c4/94/25c494b3f3b15de57162f11ce5d1b94d.jpg",
    },
    {
      image:
        "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
    },
    {
      image:
        "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
    },
    {
      image:
        "https://i.pinimg.com/564x/2c/06/47/2c064739aa03e5e0564e877d955f1df7.jpg",
    },
  ] as GalleryUnit[],
  overviewData: {
    description: `# The Artificial Paradise Tour 2025
![The Artificial Paradise Tour 2025](https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg)

### Event Description
Join us for a special music night with BlackPink, featuring their most popular hit songs. Experience the thrill of live performances with a full band, meet the artists, and enjoy exclusive fan experiences.

### Ticket Prices
- **SVIP**: 3,500,000 VND (Available: 20)
- **VIP**: 2,500,000 VND (Available: 50)
- **Standard**: 1,500,000 VND (Available: 100)
- **Economy**: 800,000 VND (Available: 200)

### Event Highlights
- Live performance with a full band
- Meet and greet with the artists
- Special gifts for the audience
- Photo opportunity with the artists (SVIP)
- Soundcheck party (VIP & SVIP)

### Terms and Conditions
- Tickets are non-refundable and non-exchangeable
- Please arrive 30 minutes before the performance
- Professional cameras are not allowed
- Follow the event organizer's regulations
`,
    organizer: "BlackPink Entertainment",
  } as OverviewData,
};
