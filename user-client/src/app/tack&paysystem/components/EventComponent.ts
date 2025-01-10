   const [event, setEvent] = useState<Event | null>({
     id: "1",
     title: "The Artificial Paradise Tour 2025",
     artist: "BlackPink",
     description: "Đêm nhạc đặc biệt với những ca khúc hit được yêu thích nhất.",
     bannerUrl: "https://salt.tkbcdn.com/.../image.jpg",
     organizer: "Dream Maker Entertainment",
     performances: [
       {
         id: "p1",
         date: "15/01/2025",
         time: "20:00",
         location: "Sân vận động Việt Trì",
         tickets: [
           { type: "SVIP", price: 3500000, available: 20 },
           { type: "VIP", price: 2500000, available: 50 },
         ],
       },
       {
         id: "p2",
         date: "16/01/2025",
         time: "19:00",
         location: "Sân vận động Mỹ Đình",
         tickets: [
           { type: "Standard", price: 1500000, available: 100 },
           { type: "Economy", price: 800000, available: 200 },
         ],
       },
     ],
   });