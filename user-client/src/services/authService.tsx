import apiClient from "@/utils/apiClient";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
}

export const authService = {
    login: async (payload: LoginPayload) => {
        const response = await apiClient.post("/login", payload);
        return response.data; // Trả về dữ liệu login (vd: token)
    },

    sendOtp: async (email: string) => {
        const response = await apiClient.post("/send-otp", { email });
        return response.data; // Trả về dữ liệu OTP (nếu cần)
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await apiClient.post("/verify-otp", { email, otp });
        return response.data; // Trả về xác nhận OTP hợp lệ
    },

    register: async (payload: { email: string; password: string }) => {
        const response = await apiClient.post("/register", payload);
        return response.data; // Đăng ký người dùng
    },
};
