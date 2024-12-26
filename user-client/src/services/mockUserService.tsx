import {RegisterPayload} from "@/services/authService.tsx";

export const mockUserService = {
  getUserProfile: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: "Người dùng giả",
          email: "fakeuser@example.com",
        });
      }, 1000);
    });
  },

  updateUserProfile: async (profileData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...profileData,
          message: "Cập nhật thành công",
        });
      }, 1000);
    });
  },

  sendOtp: async (_email:string ) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Trả về phản hồi thành công nếu email chưa đăng ký
        resolve({message: "OTP đã được gửi"});
      }, 1000);
    });
  },

  verifyOtp: async (_email: string, _otp: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (_otp === "123456") {
          resolve({message: "OTP hợp lệ"});
        }
        reject({
          status: 401,
          message: "Nhập sai mã otp",
        });
      }, 1000);
    });
  },

  resetPassword: async (_payload: RegisterPayload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({message: "Thay đổi thành công"})
      }, 1000);
    });
  },
};