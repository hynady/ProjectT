import {OccaHeroSectionUnit} from "@/app/detailpage/components/fragments/OccaHeroSection.tsx";
import {OccaShowUnit} from "@/app/detailpage/components/fragments/OccaShowSelection.tsx";

export const mockHeroData: OccaHeroSectionUnit = {
  bannerUrl: "https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg",
  title: "The Artificial Paradise Tour 2025",
  artist: "BlackPink",
  date: "2025-01-15",
  time: "20:00",
  duration: "150",
  location: "Sân vận động Việt Trì"
};
export const mockLocationData = {
  location: "Sân vận động Việt Trì",
  address: "Đ. Hùng Vương, Ph. Thọ Sơn, Việt Trì, Phú Thọ"
};

export const mockShowsData: OccaShowUnit[] = [
  {
    date: "2025-01-15",
    time: "20:00",
    prices: [
      { type: "SVIP", price: 3500000, available: 20 },
      { type: "VIP", price: 2500000, available: 50 },
      { type: "Standard", price: 1500000, available: 100 },
      { type: "Economy", price: 800000, available: 200 },
    ]
  },
  {
    date: "16/01/2025",
    time: "20:00",
    prices: [
      {type: "SVIP", price: 3500000, available: 15},
      {type: "VIP", price: 2500000, available: 45},
      {type: "Standard", price: 1500000, available: 90},
      {type: "Economy", price: 800000, available: 180},
    ]
  },
  {
    date: "17/01/2025",
    time: "20:00",
    prices: [
      {type: "SVIP", price: 3500000, available: 20},
      {type: "VIP", price: 2500000, available: 50},
      {type: "Standard", price: 1500000, available: 100},
      {type: "Economy", price: 800000, available: 200},
    ]
  }
];

export const mockGalleryData: string[] = [
  "https://i.pinimg.com/564x/95/c0/57/95c0575449ca70f8487ffcf3e586bfa9.jpg",
  "https://i.pinimg.com/564x/25/c4/94/25c494b3f3b15de57162f11ce5d1b94d.jpg",
  "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
  "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
  "https://i.pinimg.com/564x/2c/06/47/2c064739aa03e5e0564e877d955f1df7.jpg",
];

export const mockOverviewData = {
  details: `# The Artificial Paradise Tour 2025
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
  organizer: "Dream Maker Entertainment"
}

// const mockOccaDetail: IOccaDetail = {
//   id: id,
//   title: "The Artificial Paradise Tour 2025",
//   artist: "BlackPink",
//   description: "Đêm nhạc đặc biệt với những ca khúc hit được yêu thích nhất",
//   bannerUrl: "https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg",
//   date: "15/01/2025-17/01/2025",
//   time: "20:00",
//   duration: "150",
//   location: "Sân vận động việt trì",
//   address: "Đ. Hùng Vương, Ph.Thọ Sơn, Việt Trì, Phú Thọ",
//   organizer: "Dream Maker Entertainment",
//   highlights: [
//     "Live performance với dàn nhạc full band",
//     "Giao lưu cùng nghệ sĩ",
//     "Quà tặng đặc biệt cho khán giả",
//     "Photo opportunity với nghệ sĩ (SVIP)",
//     "Soundcheck party (VIP & SVIP)",
//   ],
//   shows: [
//     {
//       id: "show-1",
//       date: "15/01/2025",
//       time: "20:00",
//       duration: "150",
//       prices: [
//         {type: "SVIP", price: 3500000, available: 20},
//         {type: "VIP", price: 2500000, available: 50},
//         {type: "Standard", price: 1500000, available: 100},
//         {type: "Economy", price: 800000, available: 200},
//       ]
//     },
//     {
//       id: "show-2",
//       date: "16/01/2025",
//       time: "20:00",
//       duration: "150",
//       prices: [
//         {type: "SVIP", price: 3500000, available: 15},
//         {type: "VIP", price: 2500000, available: 45},
//         {type: "Standard", price: 1500000, available: 90},
//         {type: "Economy", price: 800000, available: 180},
//       ]
//     },
//     {
//       id: "show-3",
//       date: "17/01/2025",
//       time: "20:00",
//       duration: "150",
//       prices: [
//         {type: "SVIP", price: 3500000, available: 20},
//         {type: "VIP", price: 2500000, available: 50},
//         {type: "Standard", price: 1500000, available: 100},
//         {type: "Economy", price: 800000, available: 200},
//       ]
//     }
//   ],
//   details: `# The Artificial Paradise Tour 2025
// ![The Artificial Paradise Tour 2025](https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg)
//
// ### Event Description
// Join us for a special music night with BlackPink, featuring their most popular hit songs. Experience the thrill of live performances with a full band, meet the artists, and enjoy exclusive fan experiences.
//
// ### Ticket Prices
// - **SVIP**: 3,500,000 VND (Available: 20)
// - **VIP**: 2,500,000 VND (Available: 50)
// - **Standard**: 1,500,000 VND (Available: 100)
// - **Economy**: 800,000 VND (Available: 200)
//
// ### Event Highlights
// - Live performance with a full band
// - Meet and greet with the artists
// - Special gifts for the audience
// - Photo opportunity with the artists (SVIP)
// - Soundcheck party (VIP & SVIP)
//
// ### Terms and Conditions
// - Tickets are non-refundable and non-exchangeable
// - Please arrive 30 minutes before the performance
// - Professional cameras are not allowed
// - Follow the event organizer's regulations
// `,
//   terms: [
//     "Vé đã mua không được đổi hoặc hoàn tiền",
//     "Vui lòng đến trước giờ diễn 30 phút",
//     "Không sử dụng máy ảnh chuyên nghiệp",
//     "Tuân thủ quy định của ban tổ chức"
//   ],
//   images: [
//     "https://i.pinimg.com/564x/95/c0/57/95c0575449ca70f8487ffcf3e586bfa9.jpg",
//     "https://i.pinimg.com/564x/25/c4/94/25c494b3f3b15de57162f11ce5d1b94d.jpg",
//     "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
//     "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
//     "https://i.pinimg.com/564x/2c/06/47/2c064739aa03e5e0564e877d955f1df7.jpg",
//   ]
// };