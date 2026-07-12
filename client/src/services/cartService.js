// src/services/cartService.js
import axios from "axios";

// Đường dẫn trỏ tới Backend Laravel (thường là cổng 8000)
const API_URL = "http://127.0.0.1:8000/api";

/**
 * Hàm hỗ trợ lấy Header có kèm Token để gửi lên Server
 * Giúp Laravel xác định được người dùng nào đang thao tác
 */
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // Lấy token từ lúc em đăng nhập
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
};

export const cartService = {
  // 1. Lấy danh sách giỏ hàng
  // Method: GET
  // Route: /api/cart
  getCart: async () => {
    return await axios.get(`${API_URL}/cart`, getAuthHeader());
  },

  // 2. Thêm sản phẩm vào giỏ
  // Method: POST
  // Route: /api/cart/add
  addToCart: async (product_variant_id, quantity) => {
    return await axios.post(
      `${API_URL}/cart/add`,
      {
        product_variant_id: product_variant_id,
        quantity: quantity,
      },
      getAuthHeader(),
    );
  },

  // 3. Cập nhật số lượng
  // Method: PUT
  // Route: /api/cart/update/{id}
  updateQuantity: async (cartItemId, quantity) => {
    return await axios.put(
      `${API_URL}/cart/update/${cartItemId}`,
      {
        quantity: quantity,
      },
      getAuthHeader(),
    );
  },

  // 4. Xóa sản phẩm khỏi giỏ
  // Method: DELETE
  // Route: /api/cart/remove/{id}
  removeItem: async (cartItemId) => {
    return await axios.delete(
      `${API_URL}/cart/remove/${cartItemId}`,
      getAuthHeader(),
    );
  },
};
