// src/features/my-ticket/services/ticket.mock.ts
import { TicketDisplayUnit } from "../internal-types/ticket.type";
import { addDays, format, subDays } from "date-fns";

// Generate some sample dates
const today = new Date();
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 7);
const yesterday = subDays(today, 1);
const lastWeek = subDays(today, 7);

export const ticketMockData = {
  tickets: [
    {
      ticket: {
        id: "T-001-2345-6789",
        checkedInAt: null
      },
      occa: {
        id: "OC-001",
        title: "Hòa Nhạc Symphony",
        location: "Nhà hát Lớn Hà Nội",
      },
      show: {
        id: "SH-001",
        occaId: "OC-001",
        date: format(nextWeek, "yyyy-MM-dd"),
        time: "19:30",
        duration: 120,
        venue: "Nhà hát Lớn Hà Nội",
      },
      ticketType: {
        id: "TT-001",
        showId: "SH-001",
        type: "VIP",
        price: 1500000,
        availableQuantity: 50
      }
    },
    {
      ticket: {
          id: "03714875-d8fd-47df-bb41-f70200372d76",
          "checkedInAt": null
      },
      occa: {
          id: "e326697d-3c14-4346-9e1f-fd8530987b92",
          title: "Không thể tải thông tin sự kiện",
          location: "N/A"
      },
      show: {
          id: "3b8e3286-2a8f-4173-ba4c-d625e373deb1",
          time: "20:00",
          date: "2024-01-19"
      },
      ticketType: {
          id: "b4384d1f-3543-4d67-ad7e-f4e3c3a1525a",
          type: "VIP",
          price: 930922.29
      }
    },
    {
      ticket: {
        id: "T-002-3456-7890",
        purchasedBy: "hynady",
        purchasedAt: format(subDays(today, 15), "yyyy-MM-dd'T'HH:mm:ss"),
        checkedInAt: null
      },
      occa: {
        id: "OC-002",
        title: "Liveshow Mỹ Tâm",
        description: "Đêm nhạc đặc biệt cùng nữ ca sĩ Mỹ Tâm với những ca khúc hit mới nhất.",
        location: "Sân vận động Mỹ Đình",
        organizerId: "ORG-002"
      },
      show: {
        id: "SH-002",
        occaId: "OC-002",
        date: format(tomorrow, "yyyy-MM-dd"),
        time: "20:00",
        duration: 150,
        venue: "Sân vận động Mỹ Đình",
      },
      ticketType: {
        id: "TT-002",
        showId: "SH-002",
        type: "Standard",
        price: 800000,
        availableQuantity: 500
      }
    },
    {
      ticket: {
        id: "T-003-4567-8901",
        checkedInAt: format(lastWeek, "yyyy-MM-dd'T'HH:mm:ss")
      },
      occa: {
        id: "OC-003",
        title: "Stand-up Comedy Night",
        location: "Soul Live Project, TP.HCM",
      },
      show: {
        id: "SH-003",
        date: format(lastWeek, "yyyy-MM-dd"),
        time: "20:30",
      },
      ticketType: {
        id: "TT-003",
        type: "Premium",
        price: 650000,
      }
    },
    {
      ticket: {
        id: "T-004-5678-9012",
        purchasedBy: "hynady",
        purchasedAt: format(subDays(today, 10), "yyyy-MM-dd'T'HH:mm:ss"),
        checkedInAt: null
      },
      occa: {
        id: "OC-004",
        title: "Workshop Nhiếp Ảnh",
        description: "Workshop về nhiếp ảnh chân dung trong ánh sáng tự nhiên.",
        location: "The Oxygen, Hà Nội",
        organizerId: "ORG-004"
      },
      show: {
        id: "SH-004",
        occaId: "OC-004",
        date: format(today, "yyyy-MM-dd"),
        time: "09:00",
        duration: 240,
        venue: "The Oxygen, Hà Nội",
      },
      ticketType: {
        id: "TT-004",
        showId: "SH-004",
        type: "Workshop",
        price: 1200000,
        availableQuantity: 20
      }
    },
    {
      ticket: {
        id: "T-005-6789-0123",
        checkedInAt: format(yesterday, "yyyy-MM-dd'T'HH:mm:ss")
      },
      occa: {
        id: "OC-005",
        title: "Triển Lãm Nghệ Thuật Số",
        location: "The Factory Contemporary Arts Centre, TP.HCM",
      },
      show: {
        id: "SH-005",
        date: format(yesterday, "yyyy-MM-dd"),
        time: "10:00",
      },
      ticketType: {
        id: "TT-005",
        type: "All Day",
        price: 350000,
        availableQuantity: 200
      }
    }
  ] as TicketDisplayUnit[]
};