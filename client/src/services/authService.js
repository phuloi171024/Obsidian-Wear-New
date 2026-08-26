import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { attachUnauthorizedInterceptor } from "../utils/authInterceptor";
export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
attachUnauthorizedInterceptor(api);
export const authService = {
  login: async (email, password) => {
    const response = await api.post("/login", {
      email,
      password,
    });

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/register", userData);

    return response.data;
  },

  // Cho phép backend đặt cookie HttpOnly chứa OAuth state.
  getGoogleLoginUrl: async () => {
    const response = await api.get("/auth/google", {
      withCredentials: true,
    });

    return response.data;
  },

  // Đổi google_code dùng một lần lấy Sanctum token.
  exchangeGoogleCode: async (code) => {
    const response = await api.post("/auth/google/exchange", {
      code,
    });

    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem("access_token");

    try {
      if (!token) {
        return null;
      }

      const response = await api.post(
        "/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post("/forgot-password", {
      email,
    });

    return response.data;
  },
};
