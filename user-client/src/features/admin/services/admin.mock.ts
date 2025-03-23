import { 
    AdminOccaUnit,
    OccaStatistics,
    AdminUserInfo
} from '../internal-types/admin.type';

// Mock data for admin occas
export const mockOccas: AdminOccaUnit[] = [
    {
        id: "occa-1",
        title: "Workshop Làm Gốm Sứ",
        organizerName: "Arts Studio",
        location: "Gallery G63, Quận 1, TP.HCM",
        image: "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
        approvalStatus: "pending",
        submittedAt: "2023-12-05T10:30:00Z"
    },
    {
        id: "occa-2",
        title: "Âm Nhạc Đương Đại: Giao Thoa Văn Hóa",
        organizerName: "Music Promotions",
        location: "Nhà hát Hòa Bình, Quận 10, TP.HCM",
        image: "https://static.toiimg.com/thumb/msid-115801253,width-1070,height-580,imgsize-140568,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
        approvalStatus: "approved",
        submittedAt: "2023-12-02T14:15:00Z",
        approvedAt: "2023-12-03T09:20:00Z"
    },
    {
        id: "occa-3",
        title: "Triển Lãm Nhiếp Ảnh: Con Người Việt Nam",
        organizerName: "Photo Club",
        location: "Bảo tàng Mỹ thuật Việt Nam, Hà Nội",
        image: "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
        approvalStatus: "rejected",
        submittedAt: "2023-11-28T08:45:00Z",
        rejectedAt: "2023-11-29T11:30:00Z",
        rejectionReason: "Nội dung không phù hợp với quy định của nền tảng"
    },
    {
        id: "occa-4",
        title: "Triển Lãm Tranh Sơn Dầu",
        organizerName: "Art Gallery",
        location: "Bảo tàng Mỹ thuật TP.HCM",
        image: "https://i.pinimg.com/564x/4a/5b/6c/4a5b6c8d6e8b4a8b8b8b8b8b8b8b8b8b.jpg",
        approvalStatus: "pending",
        submittedAt: "2023-12-06T10:30:00Z"
    },
    {
        id: "occa-5",
        title: "Hội Thảo Công Nghệ 4.0",
        organizerName: "Tech Conference",
        location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
        image: "https://i.pinimg.com/564x/5b/6c/7d/5b6c7d8e9f9f9f9f9f9f9f9f9f9f9f9f.jpg",
        approvalStatus: "approved",
        submittedAt: "2023-12-01T14:15:00Z",
        approvedAt: "2023-12-02T09:20:00Z"
    }
];

// Mock user data
export const mockUsers: AdminUserInfo[] = [
    {
        id: "user-1",
        name: "Nguyen Van A",
        email: "nguyenvana@example.com",
        role: "organizer",
        status: "active",
        createdAt: "2023-10-15T08:30:00Z",
        lastActive: "2023-12-05T10:15:00Z"
    },
    {
        id: "user-2",
        name: "Tran Thi B",
        email: "tranthib@example.com",
        role: "user",
        status: "active",
        createdAt: "2023-09-22T14:20:00Z",
        lastActive: "2023-12-04T17:45:00Z"
    },
    {
        id: "user-3",
        name: "Le Van C",
        email: "levanc@example.com",
        role: "admin",
        status: "active",
        createdAt: "2023-08-10T09:15:00Z",
        lastActive: "2023-12-05T09:30:00Z"
    },
    {
        id: "user-4",
        name: "Pham Thi D",
        email: "phamthid@example.com",
        role: "user",
        status: "inactive",
        createdAt: "2023-11-05T11:40:00Z",
        lastActive: "2023-11-15T16:20:00Z"
    },
    {
        id: "user-5",
        name: "Hoang Van E",
        email: "hoangvane@example.com",
        role: "organizer",
        status: "active",
        createdAt: "2023-07-20T10:30:00Z",
        lastActive: "2023-12-05T11:00:00Z"
    }
];

// Mock statistics data
export const mockStatistics: OccaStatistics = {
    totalOccas: 156,
    approvedOccas: 98,
    pendingOccas: 45,
    rejectedOccas: 13,
    totalUsers: 324,
    ticketsSold: 2845,
    totalRevenue: 145780000,
    recentActivity: [
        {
            id: "act-1",
            type: "occa_approved",
            title: "Workshop Làm Gốm Sứ được duyệt",
            timestamp: "2023-12-05T14:30:00Z",
            actor: "Admin Team"
        },
        {
            id: "act-2",
            type: "occa_submitted",
            title: "Đêm Nhạc Jazz Đương Đại vừa được gửi duyệt",
            timestamp: "2023-12-05T12:15:00Z",
            actor: "Music Promotions"
        },
        {
            id: "act-3",
            type: "occa_rejected",
            title: "Workshop Nhiếp Ảnh Chân Dung bị từ chối",
            timestamp: "2023-12-04T18:45:00Z",
            actor: "Admin Team"
        },
        {
            id: "act-4",
            type: "occa_approved",
            title: "Triển Lãm Tranh Sơn Dầu được duyệt",
            timestamp: "2023-12-06T15:00:00Z",
            actor: "Admin Team"
        },
        {
            id: "act-5",
            type: "occa_submitted",
            title: "Hội Thảo Công Nghệ 4.0 vừa được gửi duyệt",
            timestamp: "2023-12-01T10:00:00Z",
            actor: "Tech Conference"
        }
    ]
};

// Sample slate description for mock data
export const mockSlateDescription = {
    content: `[
        {
          "type": "heading-one",
          "children": [
            {
              "text": "The Artificial Paradise Tour 2025"
            }
          ]
        },
        {
          "type": "image",
          "url": "https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg",
          "alt": "The Artificial Paradise Tour 2025",
          "children": [{ "text": "" }]
        },
        {
          "type": "heading-three",
          "children": [
            {
              "text": "Event Description"
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "text": "Join us for a special music night with BlackPink, featuring their most popular hit songs. Experience the thrill of live performances with a full band, meet the artists, and enjoy exclusive fan experiences."
            }
          ]
        },
        {
          "type": "heading-three",
          "children": [
            {
              "text": "Ticket Prices"
            }
          ]
        },
        {
          "type": "bulleted-list",
          "children": [
            {
              "type": "list-item",
              "children": [
                {
                  "text": "**SVIP**: 3,500,000 VND (Available: 20)"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "**VIP**: 2,500,000 VND (Available: 50)"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "**Standard**: 1,500,000 VND (Available: 100)"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "**Economy**: 800,000 VND (Available: 200)"
                }
              ]
            }
          ]
        },
        {
          "type": "heading-three",
          "children": [
            {
              "text": "Event Highlights"
            }
          ]
        },
        {
          "type": "bulleted-list",
          "children": [
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Live performance with a full band"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Meet and greet with the artists"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Special gifts for the audience"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Photo opportunity with the artists (SVIP)"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Soundcheck party (VIP & SVIP)"
                }
              ]
            }
          ]
        },
        {
          "type": "heading-three",
          "children": [
            {
              "text": "Terms and Conditions"
            }
          ]
        },
        {
          "type": "bulleted-list",
          "children": [
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Tickets are non-refundable and non-exchangeable"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Please arrive 30 minutes before the performance"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Professional cameras are not allowed"
                }
              ]
            },
            {
              "type": "list-item",
              "children": [
                {
                  "text": "Follow the event organizer's regulations"
                }
              ]
            }
          ]
        }
      ]`
};

// Mock show data
export const mockShows = [
    {
        id: "show-1",
        date: "2023-12-20",
        time: "19:30"
    },
    {
        id: "show-2",
        date: "2023-12-21",
        time: "19:30"
    },
    {
        id: "show-3",
        date: "2023-12-22",
        time: "20:00"
    },
    {
        id: "show-4",
        date: "2023-12-23",
        time: "18:00"
    },
    {
        id: "show-5",
        date: "2023-12-24",
        time: "19:00"
    }
];

// Mock ticket data
export const mockTickets = [
    {
        id: "ticket-show-1-1",
        type: "VIP",
        price: 500000,
        quantity: 50
    },
    {
        id: "ticket-show-1-2",
        type: "Standard",
        price: 300000,
        quantity: 100
    },
    {
        id: "ticket-show-2-1",
        type: "VIP",
        price: 550000,
        quantity: 40
    },
    {
        id: "ticket-show-2-2",
        type: "Standard",
        price: 320000,
        quantity: 90
    },
    {
        id: "ticket-show-3-1",
        type: "Premium",
        price: 600000,
        quantity: 30
    },
    {
        id: "ticket-show-3-2",
        type: "VIP",
        price: 450000,
        quantity: 50
    },
    {
        id: "ticket-show-3-3",
        type: "Standard",
        price: 280000,
        quantity: 120
    },
    {
        id: "ticket-show-4-1",
        type: "VIP",
        price: 500000,
        quantity: 60
    },
    {
        id: "ticket-show-4-2",
        type: "Standard",
        price: 300000,
        quantity: 110
    },
    {
        id: "ticket-show-5-1",
        type: "Premium",
        price: 650000,
        quantity: 35
    },
    {
        id: "ticket-show-5-2",
        type: "VIP",
        price: 480000,
        quantity: 55
    },
    {
        id: "ticket-show-5-3",
        type: "Standard",
        price: 290000,
        quantity: 130
    }
];
