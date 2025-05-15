# Hướng dẫn khắc phục lỗi CORS trong ProjectT

## Tổng quan về CORS

CORS (Cross-Origin Resource Sharing) là một cơ chế bảo mật của trình duyệt web, cho phép hoặc hạn chế các tài nguyên được yêu cầu từ một domain khác với domain phục vụ tài nguyên đó. 

Trong ProjectT, frontend (React) giao tiếp với backend (Spring Boot) thông qua API, và nếu cấu hình CORS không chính xác, trình duyệt sẽ chặn các yêu cầu từ frontend đến backend.

## Các dấu hiệu lỗi CORS

Trong console của trình duyệt, bạn có thể thấy lỗi như:

```
Access to XMLHttpRequest at 'http://backend-url/api/endpoint' from origin 'http://frontend-url' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Cách khắc phục lỗi CORS trong ProjectT

### 1. Kiểm tra cấu hình FRONTEND_URL

Biến môi trường `FRONTEND_URL` trong tệp `.env` phải được đặt chính xác để trỏ tới URL mà frontend đang chạy:

```
FRONTEND_URL=http://localhost:30000
```

- Trong môi trường phát triển local với Docker, URL này thường là `http://localhost:30000`
- Trong môi trường production, URL này nên là URL công khai của ứng dụng (ví dụ: `https://tackticket.com`)

### 2. Kiểm tra cấu hình proxy Nginx cho frontend

Tệp `nginx.conf` trong thư mục `user-client` phải cấu hình đúng để proxy các yêu cầu API:

```nginx
location /v1/ {
    proxy_pass http://backend:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. Kiểm tra WebConfig.java

Tệp `WebConfig.java` phải được cấu hình để sử dụng biến môi trường `FRONTEND_URL` như sau:

```java
@Value("${app.frontend.url:http://localhost:3000}")
private String frontendUrl;

@Override
public void addCorsMappings(@NonNull CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins(frontendUrl)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization")
            .allowCredentials(true)
            .maxAge(3600);
}
```

### 4. Hỗ trợ nhiều nguồn gốc (Multiple origins)

Nếu bạn cần hỗ trợ nhiều frontend URLs, bạn có thể sửa đổi `WebConfig.java` để hỗ trợ nhiều origins:

```java
@Value("${app.frontend.url:http://localhost:3000}")
private String frontendUrl;

@Override
public void addCorsMappings(@NonNull CorsRegistry registry) {
    // Phân tách các URLs bằng dấu phẩy
    String[] origins = frontendUrl.split(",");
    registry.addMapping("/**")
            .allowedOrigins(origins)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization")
            .allowCredentials(true)
            .maxAge(3600);
}
```

Trong trường hợp này, biến môi trường `FRONTEND_URL` sẽ có định dạng:
```
FRONTEND_URL=http://localhost:30000,https://tackticket.com
```

### 5. Kiểm tra cấu hình các biến môi trường trong Docker

Đảm bảo rằng biến môi trường `FRONTEND_URL` được truyền chính xác vào container backend trong `docker-compose.production.yml`:

```yaml
backend:
  # ...other configuration...
  environment:
    # ...other environment variables...
    - FRONTEND_URL=${FRONTEND_URL}
```

## Xác nhận CORS đã hoạt động

Để xác nhận CORS đã được cấu hình chính xác:

1. Mở Console của trình duyệt (F12)
2. Thực hiện một yêu cầu API từ frontend đến backend
3. Kiểm tra response headers của yêu cầu Preflight OPTIONS, nó phải chứa:
   - `Access-Control-Allow-Origin: http://your-frontend-url`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: *`
   
Nếu response headers này hiển thị chính xác, CORS đã được cấu hình đúng.
