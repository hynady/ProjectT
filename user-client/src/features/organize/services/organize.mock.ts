import { OrganizerOccaUnit } from '../internal-types/organize.type';
import { format, addDays, subDays } from 'date-fns';

const today = new Date();

export const organizeMockData = {
  upcoming: [
    {
      id: "org-1",
      title: "Workshop Làm Gốm Sứ",
      date: format(addDays(today, 14), "yyyy-MM-dd"),
      location: "Gallery G63, Quận 1, TP.HCM",
      status: "active",
      ticketsSold: 25,
      ticketsTotal: 50,
      image: "https://i.pinimg.com/564x/87/23/6b/87236b01fa6c084085edb0612396d62d.jpg",
    },
    {
      id: "org-2",
      title: "Âm Nhạc Đương Đại: Giao Thoa Văn Hóa",
      date: format(addDays(today, 30), "yyyy-MM-dd"),
      location: "Nhà hát Hòa Bình, Quận 10, TP.HCM",
      status: "active",
      ticketsSold: 120,
      ticketsTotal: 500,
      image: "https://static.toiimg.com/thumb/msid-115801253,width-1070,height-580,imgsize-140568,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
    },
  ] as OrganizerOccaUnit[],
  
  past: [
    {
      id: "org-3",
      title: "Triển Lãm Nhiếp Ảnh: Con Người Việt Nam",
      date: format(subDays(today, 45), "yyyy-MM-dd"),
      location: "Bảo tàng Mỹ thuật Việt Nam, Hà Nội",
      status: "completed",
      ticketsSold: 350,
      ticketsTotal: 350,
      image: "https://i.pinimg.com/564x/28/a5/af/28a5af8c9979a4588362131a417ab1d9.jpg",
    },
  ] as OrganizerOccaUnit[],
  
  draft: [
    {
      id: "org-4",
      title: "Hội Thảo Khởi Nghiệp Xanh",
      date: format(addDays(today, 60), "yyyy-MM-dd"),
      location: "Innovation Hub, Đà Nẵng",
      status: "draft",
      ticketsSold: 0,
      ticketsTotal: 200,
      image: "",
    },
  ] as OrganizerOccaUnit[],
};
