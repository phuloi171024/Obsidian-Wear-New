import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Đường dẫn gốc tới Laravel
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tự động gắn Token vào mỗi request nếu user đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosClient;
