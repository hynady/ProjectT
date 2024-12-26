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

    resetPassword: async (_payload: RegisterPayload) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({message: "Thay đổi thành công"})
            }, 5000);
        });
    },
}; 