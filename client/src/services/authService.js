import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const authService = {
  // Đăng nhập truyền thống
  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    });
    return response.data;
  },

  // Đăng ký
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  },

  // Lấy URL đăng nhập Google
  getGoogleLoginUrl: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/google/url`);
    return response.data;
  },

  // Đăng xuất (Có truyền Token)
  logout: async () => {
    const token = localStorage.getItem("auth_token");
    const response = await axios.post(
      `${API_BASE_URL}/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    // Xóa token ở local
    localStorage.removeItem("auth_token");
    return response.data;
  },
};
