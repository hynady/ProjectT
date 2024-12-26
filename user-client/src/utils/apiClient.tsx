import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Đổi URL theo backend của bạn

// Tạo instance Axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor xử lý lỗi
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
);

export default apiClient;
