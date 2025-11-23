import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm token vào header trước khi gửi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để handle 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: AxiosRequestConfig }) => {

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401) {
    

      const refreshToken = localStorage.getItem("token"); // token cũ
      if (!refreshToken) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken });
        const newToken = response.data.data.token;

        if (newToken) {
          localStorage.setItem("token", newToken);
        }
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
