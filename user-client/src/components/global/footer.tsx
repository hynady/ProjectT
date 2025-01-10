import {Mail, MapPin, Phone} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Hotline</h3>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4"/>
                <p className="text-sm">Thứ 2 - Thứ 6 (8:30 - 18:30)</p>
              </div>
              <p className="text-green-400 text-xl font-bold mt-1">1900.6408</p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Email</h3>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4"/>
                <a href="mailto:support@ticketbox.vn" className="text-sm hover:text-white">
                  support@ticketbox.vn
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Văn phòng</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1"/>
                <p className="text-sm">52 Út Tịch, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>

          {/* Customer Links */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Dành cho Khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white">
                  Điều khoản sử dụng cho khách hàng
                </a>
              </li>
            </ul>

            <h3 className="text-white font-medium pt-4">Dành cho Ban Tổ chức</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white">
                  Điều khoản sử dụng cho ban tổ chức
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Đăng ký nhận email về các sự kiện hot nhất</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-1 px-3 py-2 bg-slate-700 rounded-l focus:outline-none"
              />
              <button className="px-4 py-2 bg-slate-600 rounded-r hover:bg-slate-500">
                →
              </button>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Về công ty chúng tôi</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-white">Quy chế hoạt động</a></li>
              <li><a href="#" className="text-sm hover:text-white">Chính sách bảo mật thông tin</a></li>
              <li><a href="#" className="text-sm hover:text-white">Cơ chế giải quyết tranh chấp/ khiếu nại</a></li>
              <li><a href="#" className="text-sm hover:text-white">Chính sách bảo mật thanh toán</a></li>
              <li><a href="#" className="text-sm hover:text-white">Chính sách đổi trả và kiểm hàng</a></li>
              <li><a href="#" className="text-sm hover:text-white">Điều kiện vận chuyển và giao nhận</a></li>
              <li><a href="#" className="text-sm hover:text-white">Phương thức thanh toán</a></li>
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-4">
            <h3 className="text-white font-medium">Ứng dụng Ticketbox</h3>
            <div className="flex gap-4">
              <a href="#" className="w-32">
                <img
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="w-full"
                />
              </a>
              <a href="#" className="w-32">
                <img
                  src="/app-store-badge.png"
                  alt="Download on App Store"
                  width={135}
                  height={40}
                  className="w-full"
                />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Ứng dụng check-in cho Ban tổ chức</h3>
            <div className="flex gap-4">
              <a href="#" className="w-32">
                <img
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="w-full"
                />
              </a>
              <a href="#" className="w-32">
                <img
                  src="/app-store-badge.png"
                  alt="Download on App Store"
                  width={135}
                  height={40}
                  className="w-full"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Social & Language */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8">
          <div className="flex gap-4">
            <h3 className="text-white font-medium">Follow us</h3>
            <div className="flex gap-2">
              <a href="#" className="hover:text-white">
                <img src="/facebook.png" alt="Facebook" width={24} height={24}/>
              </a>
              <a href="#" className="hover:text-white">
                <img src="/instagram.png" alt="Instagram" width={24} height={24}/>
              </a>
              <a href="#" className="hover:text-white">
                <img src="/tiktok.png" alt="TikTok" width={24} height={24}/>
              </a>
              <a href="#" className="hover:text-white">
                <img src="/threads.png" alt="Threads" width={24} height={24}/>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <h3 className="text-white font-medium">Ngôn ngữ</h3>
            <div className="flex gap-2">
              <button>
                <img src="/vn-flag.png" alt="Tiếng Việt" width={24} height={24}/>
              </button>
              <button>
                <img src="/en-flag.png" alt="English" width={24} height={24}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <img src="/logo.png" alt="Ticketbox" width={120} height={40}/>
              <p className="text-sm mt-2">Hệ thống quản lý và phân phối vé sự kiện hàng đầu Việt Nam</p>
              <p className="text-sm">TicketBox Co. Ltd. © 2018</p>
            </div>

            <div className="text-sm space-y-2">
              <p>Công ty TNHH Ticketbox</p>
              <p>Đại diện theo pháp luật: Trần Ngọc Thái Sơn</p>
              <p>Địa chỉ: Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng Tám, Phường 12, Quận 10, TP. Hồ Chí Minh</p>
              <p>Hotline: 1900.6408 - Email: support@ticketbox.vn</p>
              <p>Giấy chứng nhận đăng ký doanh nghiệp số: 0313605444, cấp lần đầu ngày 07/01/2016 bởi Sở Kế Hoạch và
                Đầu Tư TP. Hồ Chí Minh</p>
            </div>

            <div className="flex justify-end">
              <img src="/bo-cong-thuong.png" alt="Đã đăng ký Bộ Công Thương" width={150} height={56}/>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer