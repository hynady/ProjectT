# Ghi chú và Giải thích về thiết lập CI/CD

## Giới thiệu

File này chứa ghi chú và giải thích chi tiết về thiết lập CI/CD (Continuous Integration/Continuous Deployment) đã được cấu hình cho ProjectT. Tài liệu này giúp bạn hiểu rõ cách luồng CI/CD hoạt động và hướng dẫn cách thiết lập môi trường.

## Quy trình CI/CD

Quy trình CI/CD được cấu hình trong file `.github/workflows/ci-cd.yml` tự động thực hiện các bước sau:

### 1. Xây dựng và Kiểm thử (Build and Test)

- **Khi nào chạy**: Mỗi khi có commit được đẩy lên nhánh `main` hoặc `master`, hoặc khi có Pull Request vào các nhánh này
- **Các bước thực hiện**:
   - Thiết lập môi trường Java (JDK 17) cho backend
   - Thiết lập môi trường Node.js (Node 18) cho frontend
   - Biên dịch và kiểm thử ứng dụng Spring Boot (backend)
   - Cài đặt dependencies và build ứng dụng React (frontend)
   - Build Docker image cho cả backend và frontend

### 2. Triển khai (Deploy)

- **Khi nào chạy**: Sau khi job "build-and-test" hoàn thành thành công VÀ:
   - Khi push code lên nhánh `main` hoặc `master` HOẶC
   - Khi kích hoạt thủ công với tùy chọn "Deploy to production"
- **Các bước thực hiện**:
   - Thiết lập kết nối đến server sản phẩm sử dụng username/password
   - Tạo gói triển khai bao gồm mã nguồn, docker-compose và script triển khai
   - Tạo file `.env` với tất cả biến môi trường cần thiết từ GitHub Secrets
   - Chuyển gói triển khai đến server
   - Khởi động hoặc khởi động lại các container Docker trên server

## Chi tiết kỹ thuật

### Cài đặt GitHub Secrets

Để thiết lập GitHub Secrets cho repository của bạn, hãy thực hiện theo các bước sau:

#### Tự động thêm tất cả secrets từ file .env

1. **Sử dụng script PowerShell (Windows)**:
   ```
   bin\run-ps-script.cmd owner/Repo
   ```
   Script này sẽ tự động đọc tất cả biến từ file `.env` và thêm vào GitHub Secrets.

2. **Sử dụng script Bash (Linux/macOS)**:
   ```bash
   ./bin/add-github-secrets.sh owner/Repo
   ```

> Lưu ý: Trước khi chạy script, bạn cần cài đặt GitHub CLI (gh) và đăng nhập bằng lệnh `gh auth login`

#### Thêm thủ công (nếu cần)

Các secrets sau cần được cấu hình trong mục GitHub repository (Settings > Secrets and variables > Actions):

#### Truy cập Server
- `SERVER_HOST`: Tên miền hoặc địa chỉ IP của server (vd: 103.130.211.150)
- `SERVER_PORT`: Cổng SSH của server (vd: 10079)
- `SERVER_USER`: Tên người dùng SSH (vd: sysadmin)
- `SERVER_PASSWORD`: Mật khẩu người dùng SSH 
- `DEPLOY_PATH`: Đường dẫn trên server để triển khai ứng dụng

> **Chú ý**: Trước đây chúng ta sử dụng SSH key để xác thực, nhưng hiện tại chúng ta đã chuyển sang dùng username/password cho việc đăng nhập SSH vào server.

#### Biến môi trường ứng dụng
- `APP_NAME`: Tên ứng dụng
- `DB_DRIVER`: Driver cơ sở dữ liệu
- `MYSQL_DATABASE`: Tên database MySQL
- `MYSQL_USER`: Tên người dùng MySQL
- `MYSQL_PASSWORD`: Mật khẩu MySQL
- `MYSQL_ROOT_PASSWORD`: Mật khẩu root MySQL
- `JPA_DIALECT`: JPA dialect
- `JPA_DDL_AUTO`: Giá trị JPA DDL auto
- `KAFKA_CONSUMER_GROUP_ID`: ID nhóm tiêu thụ Kafka
- `KAFKA_CONSUMER_AUTO_OFFSET_RESET`: Giá trị reset offset tự động
- `JWT_SECRET`: Khóa bí mật JWT cho xác thực
- `GOOGLE_CLIENT_ID`: ID client Google OAuth
- `MAIL_USERNAME`: Tên đăng nhập email
- `MAIL_PASSWORD`: Mật khẩu email
- `MAIL_SENDER_NAME`: Tên người gửi email
- `SEPAY_API_KEY`: Khóa API thanh toán
- `SEPAY_URL`: URL API thanh toán
- `FRONTEND_URL`: URL frontend cho CORS
- `VITE_GOOGLE_MAPS_API_KEY`: Khóa API Google Maps
- `VITE_ENABLE_MOCK`: Bật/tắt dữ liệu mô phỏng
- `VITE_CLOUDINARY_CLOUD_NAME`: Tên Cloudinary
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Preset tải lên Cloudinary
- `VITE_CLOUDINARY_API_KEY`: Khóa API Cloudinary

### Triển khai thủ công

Bạn có thể kích hoạt quy trình triển khai thủ công:
1. Truy cập tab "Actions" trong GitHub repository
2. Chọn workflow "CI/CD Pipeline"
3. Nhấp "Run workflow"
4. Chọn "Deploy to production" và xác nhận

### Yêu cầu đối với Server

Server cần đáp ứng các yêu cầu sau:
- Đã cài đặt Docker và Docker Compose
- Có thể truy cập qua SSH với thông tin đăng nhập username/password đã cung cấp
- Có đủ quyền để chạy các container Docker
- Có dịch vụ MySQL và các dịch vụ khác đã được thiết lập đúng cách

## Cách luồng làm việc hoạt động

1. Developer đẩy code lên GitHub, tạo Pull Request hoặc merge vào nhánh chính (main/master)
2. GitHub Actions tự động kích hoạt workflow CI/CD
3. Ứng dụng được build, test và tạo Docker image
4. Nếu thành công và điều kiện triển khai được đáp ứng, hệ thống sẽ triển khai tự động đến server
5. Trên server, các container cũ sẽ được dừng và thay thế bằng container mới
6. Ứng dụng đã cập nhật sẽ hoạt động mà không cần can thiệp thủ công

## Xử lý sự cố

Nếu gặp vấn đề với quy trình CI/CD:

1. Kiểm tra logs trong tab Actions của GitHub repository
2. Đảm bảo tất cả secrets đã được cấu hình chính xác
3. Kiểm tra kết nối SSH đến server
4. Kiểm tra Docker và Docker Compose đã được cài đặt đúng trên server
5. Nếu cần, kích hoạt lại workflow thủ công với các sửa đổi cần thiết