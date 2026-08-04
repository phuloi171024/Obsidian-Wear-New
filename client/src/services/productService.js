import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const productService = {
  // 1. Lấy dữ liệu trang chủ (Sản phẩm mới nhất + Danh mục)
  getHomeData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/home`);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi lấy dữ liệu trang chủ:", error);
      throw error;
    }
  },

  // 2. Lấy danh sách sản phẩm, hỗ trợ tìm kiếm & bộ lọc đa chiều (giá, size, màu, danh mục, brand)
  getProducts: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: filters, // Truyền object query parameters (search, min_price, size, v.v.)
      });
      return response.data.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      throw error;
    }
  },

  // 3. Lấy chi tiết một sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      throw error;
    }
  },

  // 4. Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích (Wishlist)
  toggleWishlist: async (productId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/wishlist/toggle`,
        { product_id: productId },
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
