import { BaseService } from "@/commons/base.service";
import {
  LoginPayload,
  LoginResponse,
  OtpResponse,
  RegisterPayload,
  RegisterResponse, ResetPasswordPayload
} from "@/features/auth/internal-types/auth.ts";
import {authMockData} from "@/features/auth/services/auth.mock.ts";

class AuthService extends BaseService {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: payload,
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          const { validCredentials, response } = authMockData.login;
          if (payload.email === validCredentials.email &&
            payload.password === validCredentials.password) {
            resolve(response);
          }
          reject({ status: 403, message: 'Thông tin đăng nhập chưa đúng' });
        }, 1000);
      })
    });
  }

  async sendRegisterOtp(email: string): Promise<OtpResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/register/send-otp',
      data: { email },
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === authMockData.otp.existingEmail) {
            reject({
              status: 409, 
              message: "Email này đã có tài khoản.",
            });
          }
          resolve({ message: "OTP đã được gửi" });
        }, 1000);
      })
    });
  }

  async sendResetOtp(email: string): Promise<OtpResponse> {
    return this.request({
      method: 'POST', 
      url: '/auth/reset-password/send-otp',
      data: { email },
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === authMockData.otp.blockedEmail) {
            reject({
              status: 404,
              message: "Email này chưa đăng ký tài khoản.",
            });
          }
          resolve({ message: "OTP đã được gửi" });
        }, 1000);
      })
    });
  }

  async verifyOtp(email: string, otp: string): Promise<OtpResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/verify-otp',
      data: { email, otp },
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (otp === authMockData.otp.validOtp) {
            resolve({ message: "OTP hợp lệ" });
          }
          reject({
            status: 401,
            message: "Nhập sai mã otp",
          });
        }, 1000);
      })
    });
  }
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: payload,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({ message: "Đăng ký thành công" });
        }, 1000);
      })
    });
  }
  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    return this.request({
      method: 'POST',
      url: '/auth/reset-password',
      data: payload,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({ message: "Thay đổi mật khẩu thành công" });
        }, 1000);
      })
    });
  }
}

export const authService = new AuthService();