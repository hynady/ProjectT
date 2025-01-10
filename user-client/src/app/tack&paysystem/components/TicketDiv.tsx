import { CalendarDays, MapPin } from 'lucide-react';

const EventTicket = () => {
  return (
    <div className="relative max-w-4xl bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row relative">
        {/* Left side ticket info */}
        <div className="p-6 space-y-4 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            SÀI GÒN SIMPLE LOVE 2025
          </h1>

          <div className="flex items-center text-emerald-400 space-x-2">
            <CalendarDays className="w-5 h-5" />
            <span>18:00 - 23:00, 15 Tháng 02, 2025</span>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400 mt-1" />
            <div className="text-gray-300">
              <div className="font-medium">Vạn Phúc City</div>
              <div className="text-sm">
                375 Quốc lộ 13, Khu phố 5, Phường Hiệp Bình Phước, Quận Thủ Đức, Thành Phố Hồ Chí Minh
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-700">
            <div className="text-gray-400">Giá từ</div>
            <div className="text-2xl font-bold text-emerald-400">
              1.000.000 đ
            </div>
          </div>

          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Mua vé ngay
          </button>
        </div>

        {/* Divider with notches */}
        <div className="hidden md:block relative">
          {/* Top notch */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full z-50" />

          {/* Bottom notch */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full z-50" />

          {/* Vertical dotted line */}
          <div className="h-full border-l-4 border-dashed border-zinc-700" />
        </div>

        {/* Right side event image */}
        <div className="relative w-full md:w-2/3 aspect-[16/9] md:aspect-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-900/30">
            <div className="w-full h-full bg-[url('/api/placeholder/800/600')] bg-cover bg-center opacity-90">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-white drop-shadow-lg">
                    15.02
                  </div>
                  <div className="text-4xl font-bold text-white drop-shadow-lg">
                    2025
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTicket;