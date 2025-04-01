import { OrganizerOccaUnit, ShowResponse, CategoryType } from "../internal-types/organize.type";

export const organizeMockData = {
  occas: [
    {
      id: "org-1",
      title: "Workshop Làm Gốm Sứ",
      location: "Gallery G63, Quận 1, TP.HCM",
      image:
        "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-2",
      title: "Âm Nhạc Đương Đại: Giao Thoa Văn Hóa",
      location: "Nhà hát Hòa Bình, Quận 10, TP.HCM",
      image:
        "https://static.toiimg.com/thumb/msid-115801253,width-1070,height-580,imgsize-140568,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
      approvalStatus: "pending",
    },
    {
      id: "org-5",
      title: "Triển Lãm Nghệ Thuật Số",
      location: "VCCA, Hà Nội",
      image:
        "https://i.pinimg.com/564x/4e/b7/a5/4eb7a5dbd2c1949e9cd2251ce0748e69.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-6",
      title: "Hội Chợ Ẩm Thực Đường Phố",
      location: "Công viên 23/9, TP.HCM",
      image:
        "https://i.pinimg.com/564x/e0/93/ea/e093ea5f00sldjf29d8a9ac94sdlf2.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-3",
      title: "Triển Lãm Nhiếp Ảnh: Con Người Việt Nam",
      location: "Bảo tàng Mỹ thuật Việt Nam, Hà Nội",
      image:
        "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-7",
      title: "Festival Âm Nhạc Mùa Hè",
      location: "Bãi biển Nha Trang, Khánh Hòa",
      image:
        "https://i.pinimg.com/564x/8f/e7/ac/8fe7ac9d8c62b5f6c34ec30c68a7b4fc.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-8",
      title: "Hội Nghị Công Nghệ 4.0",
      location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
      image:
        "https://i.pinimg.com/564x/78/9e/7a/789e7a7dc9bd6eb2b90d0abb14b679dd.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-4",
      title: "Hội Thảo Khởi Nghiệp Xanh",
      location: "Innovation Hub, Đà Nẵng",
      image: "",
      approvalStatus: "draft",
    },
    {
      id: "org-9",
      title: "Lớp Học Nấu Ăn Chay",
      location: "Culinary Arts Center, TP.HCM",
      image: "",
      approvalStatus: "pending",
    },
    {
      id: "org-10",
      title: "Workshop Kỹ Năng Thuyết Trình",
      location: "WeWork Office, TP.HCM",
      image: "",
      approvalStatus: "pending",
    },
    {
      id: "org-11",
      title: "Lễ Hội Pháo Hoa Quốc Tế",
      location: "Sông Hàn, Đà Nẵng",
      image:
        "https://i.pinimg.com/564x/5f/3a/2b/5f3a2b8e9c1d4f7a8b9e2c3d5e6f7a8b.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-12",
      title: "Hội Sách Cũ Hà Nội",
      location: "Phố Sách 19/12, Hà Nội",
      image:
        "https://i.pinimg.com/564x/9a/2b/3c/9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6.jpg",
      approvalStatus: "pending",
    },
    {
      id: "org-13",
      title: "Triển Lãm Tranh Thêu Thủ Công",
      location: "Làng nghề Thừa Thiên Huế",
      image: "",
      approvalStatus: "draft",
    },
    {
      id: "org-14",
      title: "Ngày Hội Thể Thao Sinh Viên",
      location: "Sân vận động Đại học Quốc gia, TP.HCM",
      image:
        "https://i.pinimg.com/564x/1b/2c/3d/1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p.jpg",
      approvalStatus: "approved",
    },
    {
      id: "org-15",
      title: "Workshop Vẽ Tranh Sơn Dầu",
      location: "Art Studio, Quận 3, TP.HCM",
      image: "",
      approvalStatus: "rejected",
    },
  ] as OrganizerOccaUnit[],
  
  // Adding mock data for shows
  showsByOccaId: (occaId: string): ShowResponse[] => [
    {
      id: `show-${occaId}-1`,
      date: "2025-12-15",
      time: "19:30",
      saleStatus: "sold_out", // Changed from status to saleStatus and value from "available" to "on_sale"
      tickets: [
        { id: "ticket-1", type: "VIP", price: 500000, available: 50, sold: 20 },
        { id: "ticket-2", type: "Standard", price: 300000, available: 100, sold: 45 },
        { id: "ticket-9", type: "Standard", price: 300000, available: 100, sold: 45 },
        { id: "ticket-10", type: "Standard", price: 300000, available: 100, sold: 45 },
        { id: "ticket-11", type: "Standard", price: 300000, available: 100, sold: 45 },
        { id: "ticket-12", type: "Standard", price: 300000, available: 100, sold: 45 },
        { id: "ticket-13", type: "Standard", price: 300000, available: 100, sold: 45 },

      ],
    },
    {
      id: `show-${occaId}-2`,
      date: "2025-12-16",
      time: "19:30",
      saleStatus: "on_sale", // Changed from status to saleStatus and value from "available" to "on_sale"
      tickets: [
        { id: "ticket-3", type: "VIP", price: 500000, available: 50, sold: 15 },
        { id: "ticket-4", type: "Standard", price: 300000, available: 100, sold: 35 },
      ],
    },
    {
      id: `show-${occaId}-3`,
      date: "2025-12-17",
      time: "20:00",
      saleStatus: "upcoming", // Changed from status to saleStatus
      tickets: [
        { id: "ticket-5", type: "VIP", price: 500000, available: 50 },
        { id: "ticket-6", type: "Standard", price: 300000, available: 100 },
      ],
    },
    {
      id: `show-${occaId}-4`,
      date: "2025-12-10",
      time: "19:00",
      saleStatus: "ended", // Changed from status to saleStatus and value from "past" to "ended"
      tickets: [
        { id: "ticket-7", type: "VIP", price: 500000, available: 0, sold: 50 },
        { id: "ticket-8", type: "Standard", price: 300000, available: 0, sold: 100 },
      ],
    }
  ],

  // Adding mock categories data
  categories: [
    {id: "1", name: "Âm nhạc"},
    {id: "2", name: "Phim"},
    {id: "3", name: "Thể thao"},
    {id: "4", name: "Sân khấu"},
    {id: "5", name: "Lễ hội"},
    {id: "6", name: "Hội thảo"},
    {id: "7", name: "Trải nghiệm"},
    {id: "8", name: "Giải trí"},
  ] as CategoryType[]
};
