import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  response => {
    // Return the actual data from the response
    console.log("Axios response:", response);
    return response.data;
  },
  error => {
    console.error("Axios error:", error);
    const apiError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    };
    return Promise.reject(apiError);
  }
);

export default axiosInstance;