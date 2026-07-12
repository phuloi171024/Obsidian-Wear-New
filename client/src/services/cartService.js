// src/services/cartService.js
import axios from "axios";

// Thay đổi cổng 8000 nếu Laravel của em chạy ở cổng khác
const API_URL = "http://127.0.0.1:8000/api";

// Hàm cấu hình Header chứa Token đăng nhập
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // Đảm bảo lúc đăng nhập em đã lưu token vào đây
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const cartService = {
  // 1. Lấy danh sách giỏ hàng
  getCart: async () => {
    return await axios.get(`${API_URL}/cart`, getAuthHeader());
  },

  // 2. Thêm vào giỏ hàng
  addToCart: async (variantId, quantity) => {
    return await axios.post(
      `${API_URL}/cart/add`,
      {
        product_variant_id: variantId,
        quantity: quantity,
      },
      getAuthHeader(),
    );
  },

  // 3. Cập nhật số lượng
  updateQuantity: async (cartItemId, quantity) => {
    return await axios.put(
      `${API_URL}/cart/update/${cartItemId}`,
      {
        quantity: quantity,
      },
      getAuthHeader(),
    );
  },

  // 4. Xóa sản phẩm
  removeItem: async (cartItemId) => {
    return await axios.delete(
      `${API_URL}/cart/remove/${cartItemId}`,
      getAuthHeader(),
    );
  },
};
