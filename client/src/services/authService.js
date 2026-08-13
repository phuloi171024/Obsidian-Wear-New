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
    const response = await axios.get(`${API_BASE_URL}/auth/google`);

    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    const token = localStorage.getItem("access_token");

    try {
      // Nếu không có token thì không gọi API logout
      if (!token) {
        return null;
      }

      const response = await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      return response.data;
    } finally {
      // Luôn xóa token local dù API logout thành công hay thất bại
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
    }
  },
};
