import apiClient from "@/utils/apiClient";

export const userService = {
    getUserProfile: async () => {
        const response = await apiClient.get("/user/profile");
        return response.data;
    },

    updateUserProfile: async (profileData: any) => {
        const response = await apiClient.put("/user/profile", profileData);
        return response.data;
    },
};
