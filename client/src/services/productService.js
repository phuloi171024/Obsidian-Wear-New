import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const productService = {
  // 1. Lấy dữ liệu trang chủ
  getHomeData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/home`);
      // Hỗ trợ cả trường hợp response.data.data hoặc response.data
      return response.data.data || response.data;
    } catch (error) {
      console.error("Lỗi lấy dữ liệu trang chủ:", error);
      throw error;
    }
  },

  // 2. Lấy danh sách sản phẩm
  getProducts: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: filters,
      });

      // Kiểm tra cấu trúc trả về từ Laravel để tránh bị undefined
      const resData = response.data;
      if (resData.status === true) {
        return resData.data; // Trường hợp có cấu trúc { status: true, data: [...] }
      }
      return resData; // Trường hợp trả về mảng trực tiếp [...]
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      throw error;
    }
  },

  // 3. Lấy chi tiết sản phẩm
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      throw error;
    }
  },

  // 4. Thêm / xóa sản phẩm khỏi Wishlist (Đã thêm tiền tố /user/ khớp với route Laravel)
  toggleWishlist: async (productId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/wishlist/toggle`,
        {
          product_id: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Lỗi cập nhật Wishlist:", error);
      throw error;
    }
  },
};
