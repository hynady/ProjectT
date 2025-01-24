import {RegisterPayload} from "@/features/auth/hooks/authService.tsx";

export const mockAuthService = {
  // Hàm giả lập đăng nhập
  login: async (_payload: { email: string; password: string }) => {
    return new Promise<{ token: string }>((resolve, reject) => {
      setTimeout(() => {
        // Kiểm tra thông tin đăng nhập (giả lập)
        if (_payload.email === 'duyvnlx3016@gmail.com' && _payload.password === 'Namduy2003@))#') {
          // Giả lập phản hồi từ server với JWT token
          const token = 'fake-jwt-token';
          // Trả về token giả
          resolve({ token });
        } else {
          reject({ status: 403, message: 'Thông tin đăng nhập chưa đúng' });        }
      }, 1000);
    });
  },

  sendOtp: async (email: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "duyvnlx2003@gmail.com") {
          // Trả về lỗi 429 nếu email khớp
          reject({
            status: 429,
            message: "Quá số lần yêu cầu OTP. Vui lòng thử lại sau.",
          });
        } else if (email === "hnduy.self@gmail.com") {
          // Trả về lỗi 409 nếu email đã có tài khoản
          reject({
            status: 409,
            message: "Email này đã có tài khoản.",
          });
        } else {
          // Trả về phản hồi thành công nếu email chưa đăng ký
          resolve({ message: "OTP đã được gửi" });
        }
      }, 1000);
    });
  },


  verifyOtp: async (_email: string, _otp: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if(_otp==="123456"){
          resolve({message: "OTP hợp lệ"});
        }
        reject({
          status: 401,
          message: "Nhập sai mã otp",
        });
      }, 1000);
    });
  },

  register: async (_payload: RegisterPayload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({message: "Đăng ký thành công"});
      }, 1000);
    });
  },
}; 