import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Thêm interceptors nếu cần
axiosInstance.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error.response?.data || error)
);

export default axiosInstance;