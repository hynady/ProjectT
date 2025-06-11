# Hướng dẫn tích hợp Google OAuth

## Tại sao cần Google Client Secret?

Google OAuth có 2 phương thức chính:

### 1. Client-side Flow (Frontend Only)
- **Ưu điểm**: Đơn giản, không cần backend xử lý OAuth
- **Nhược điểm**: 
  - Client ID exposed trong frontend code
  - Ít bảo mật hơn vì có thể bị reverse engineer
  - Không kiểm soát được token lifecycle ở server

### 2. Server-side Flow (Recommended)
- **Ưu điểm**:
  - Client Secret được bảo vệ ở server
  - Backend kiểm soát hoàn toàn quá trình xác thực
  - Có thể implement refresh token
  - Audit log đầy đủ
- **Nhược điểm**: Phức tạp hơn một chút

**Hybrid Approach (Được sử dụng trong project này)**:
- Frontend sử dụng Google OAuth để lấy ID Token
- Backend verify ID Token bằng Google API với Client Secret
- Tối ưu cả security và user experience

## 1. Tạo Google OAuth App

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật **Google Identity API** và **Google+ API**
4. Vào **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Chọn **Web application**
6. Thêm **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000` (development) 
   - `https://yourdomain.com` (production)
   - `http://localhost:8080/v1/auth/google/callback` (cho server-side flow nếu cần)
8. **Lưu và copy cả Client ID và Client Secret**

## 2. Cấu hình Backend

### Environment Variables (.env hoặc system variables)
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Other configs
JWT_SECRET=your_jwt_secret_here
DB_URL=jdbc:mysql://localhost:3306/your_database
DB_USERNAME=root
DB_PASSWORD=your_password
```

**⚠️ QUAN TRỌNG**: 
- **KHÔNG BAO GIỜ** commit Client Secret vào git
- Sử dụng environment variables hoặc secret management service
- Trong production, sử dụng Azure Key Vault, AWS Secrets Manager, hoặc tương tự

### Database Migration
```sql
-- Add google_id column to end_user table
ALTER TABLE end_user ADD COLUMN google_id VARCHAR(255) NULL;
CREATE INDEX idx_end_user_google_id ON end_user(google_id);
```

## 3. Cấu hình Frontend

### Environment Variables (.env.development/.env.production)
```bash
# Google OAuth (Chỉ Client ID, KHÔNG BAO GIỜ để Client Secret ở frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration
VITE_API_BASE_URL=http://localhost:8080/v1
VITE_MOCK_API=false
```

## 4. Testing

1. Cấu hình environment variables trong backend
2. Start backend server: `./gradlew bootRun`
3. Cấu hình environment variables trong frontend  
4. Start frontend: `npm run dev`
5. Truy cập `http://localhost:3000/login`
6. Click vào nút "Sign in with Google"
7. Hoàn thành OAuth flow với Google
8. Kiểm tra database để confirm user được tạo/cập nhật

## 5. API Endpoints

### POST `/v1/auth/google-login`
Xử lý đăng nhập Google OAuth (ID Token flow).

**Request Body:**
```json
{
  "idToken": "google_id_token_from_frontend"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### GET `/v1/auth/google-auth-url`
Endpoint cho server-side OAuth flow (optional).

**Response:**
```json
{
  "message": "Use frontend Google OAuth with client-side flow",
  "hint": "Use Google OAuth2 library on frontend"
}
```

## 6. Security Best Practices

### Backend Security
- **Client Secret**: Luôn lưu ở server, không bao giờ expose ra frontend
- **Token Verification**: Verify Google ID Token ở backend trước khi tạo session
- **Rate Limiting**: Implement rate limiting cho OAuth endpoints
- **HTTPS**: Bắt buộc sử dụng HTTPS trong production
- **Audit Logging**: Log tất cả các lần đăng nhập và lỗi

### Frontend Security  
- **Client ID Only**: Chỉ sử dụng Client ID ở frontend
- **Token Handling**: Không store sensitive data ở client
- **Error Handling**: Handle OAuth errors gracefully
- **CORS**: Đảm bảo domain được config đúng trong Google Console

### Database Security
- **Google ID Index**: Tạo index cho google_id column để tăng performance
- **Email Uniqueness**: Đảm bảo email unique constraint
- **Password Field**: Vẫn cần password field cho non-Google users

## 7. Troubleshooting

### Lỗi "Invalid client ID"
- ✅ Kiểm tra `GOOGLE_CLIENT_ID` trong environment variables
- ✅ Đảm bảo domain được thêm vào **Authorized JavaScript origins**
- ✅ Verify environment được load đúng (dev/prod)

### Lỗi "Token verification failed"  
- ✅ Kiểm tra `GOOGLE_CLIENT_SECRET` ở backend
- ✅ Đảm bảo Google APIs được bật (Google Identity API)
- ✅ Kiểm tra network connection
- ✅ Verify token chưa expire

### Lỗi "Unauthorized" hoặc 403
- ✅ Kiểm tra CORS configuration
- ✅ Verify domain trong **Authorized origins**
- ✅ Check API quotas và limits

### User không được tạo trong database
- ✅ Kiểm tra database connection
- ✅ Verify database schema (google_id column exists)
- ✅ Check application logs cho detailed errors
- ✅ Ensure email field accepts Google email format

### Lỗi "Client ID not found" hoặc "Invalid audience"
- ✅ Verify `VITE_GOOGLE_CLIENT_ID` trong frontend environment
- ✅ Restart development server sau khi thay đổi env vars
- ✅ Check browser console cho JavaScript errors

## 8. Production Deployment Checklist

### Backend
- [ ] Set `GOOGLE_CLIENT_SECRET` trong production environment
- [ ] Configure HTTPS endpoints  
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure audit logging
- [ ] Set up monitoring và alerting

### Frontend
- [ ] Set production `VITE_GOOGLE_CLIENT_ID`
- [ ] Configure production API URLs
- [ ] Enable HTTPS
- [ ] Test OAuth flow trong production environment
- [ ] Verify redirect URIs match production domain

### Google Console
- [ ] Add production domain vào Authorized Origins
- [ ] Add production redirect URIs
- [ ] Set up quota monitoring
- [ ] Review API permissions và scopes
- [ ] Configure OAuth consent screen với production info

### Database
- [ ] Run database migrations
- [ ] Verify indexes
- [ ] Set up backup strategy cho user data
- [ ] Configure monitoring cho OAuth-related tables
