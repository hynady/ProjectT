# Hướng dẫn tạo tệp .env

Để triển khai ứng dụng TackTicket cần cấu hình đúng các biến môi trường. Tài liệu này hướng dẫn chi tiết cách tạo tệp `.env` từ template có sẵn.

## Bước 1: Tạo tệp .env từ template

### Trên Windows:
```
.\create-env.cmd
```

### Trên Linux/macOS:
```
chmod +x create-env.sh
./create-env.sh
```

## Bước 2: Cập nhật thông tin trong tệp .env

Sau khi tạo tệp .env, bạn cần cập nhật tất cả các giá trị placeholder với thông tin thực tế của bạn:

### Thông tin quan trọng cần thay đổi:

1. **Cấu hình cơ sở dữ liệu**:
   - `MYSQL_ROOT_PASSWORD`: Mật khẩu root của MySQL
   - `MYSQL_PASSWORD`: Mật khẩu người dùng ứng dụng

2. **Cấu hình bảo mật**:
   - `JWT_SECRET`: Khóa bí mật để tạo và xác minh JWT tokens
   - `GOOGLE_CLIENT_ID`: Client ID từ Google Cloud Console

3. **Cấu hình email**:
   - `MAIL_USERNAME`: Địa chỉ email gửi thông báo
   - `MAIL_PASSWORD`: Mật khẩu ứng dụng (App Password) cho email

4. **Cấu hình thanh toán**:
   - `SEPAY_API_KEY`: Khóa API cho dịch vụ thanh toán

5. **Cấu hình CORS**:
   - `FRONTEND_URL`: URL của frontend mà backend sẽ chấp nhận yêu cầu CORS từ đó
     * Trong môi trường local với Docker: `http://localhost:30000`
     * Trong môi trường production: URL công khai của ứng dụng (ví dụ: `https://tackticket.com`)

6. **Cấu hình frontend**:
   - `VITE_API_BASE_URL`: URL API backend
   - `VITE_WS_BASE_URL`: URL WebSocket
   - `VITE_GOOGLE_MAPS_API_KEY`: Khóa API Google Maps
   - Thông tin Cloudinary cho lưu trữ media

## Bước 3: Kiểm tra cấu hình

Sau khi cập nhật tất cả thông tin, hãy kiểm tra lại một lần nữa để đảm bảo:

1. Không có giá trị placeholder nào còn sót lại
2. Tất cả mật khẩu và khóa bí mật đều đủ mạnh
3. Các URL được cấu hình chính xác cho môi trường production

## Lưu ý bảo mật quan trọng

- **KHÔNG BAO GIỜ** commit tệp `.env` lên hệ thống quản lý phiên bản (git)
- Tạo backup an toàn cho tệp `.env` ở nơi bảo mật
- Đảm bảo quyền truy cập tệp được giới hạn chỉ cho người dùng cần thiết
- Xem xét sử dụng công cụ quản lý bí mật như HashiCorp Vault trong môi trường production thực tế
