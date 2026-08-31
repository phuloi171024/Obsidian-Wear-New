import { apiUrl } from "../config/api";

const token = () =>
  localStorage.getItem("access_token") || localStorage.getItem("token") || "";

const request = async (path, options = {}) => {
  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };
  if (token()) headers.Authorization = `Bearer ${token().trim()}`;

  const response = await fetch(apiUrl(path), { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    window.location.assign("/login");
  }
  if (!response.ok) {
    const firstError = data?.errors
      ? Object.values(data.errors).flat().find(Boolean)
      : null;
    throw new Error(firstError || data?.message || "Không thể kết nối máy chủ.");
  }
  return data;
};

export const checkoutService = {
  cart: () => request("cart"),
  addresses: () => request("user/addresses"),
  createAddress: (payload) => request("user/addresses", {
    method: "POST", body: JSON.stringify(payload),
  }),
  provinces: () => request("locations/provinces"),
  wards: (provinceCode) => request(`locations/provinces/${provinceCode}/wards`),
  coupons: () => request("coupons"),
  applyCoupon: (payload) => request("coupons/apply", {
    method: "POST", body: JSON.stringify(payload),
  }),
  quote: (payload) => request("shipping/quote", {
    method: "POST", body: JSON.stringify(payload),
  }),
  createOrder: (payload) => request("orders", {
    method: "POST", body: JSON.stringify(payload),
  }),
  getOrder: (orderId) => request(`orders/${orderId}`),
  updatePaymentMethod: (orderId, paymentMethod) =>
    request(`orders/${orderId}/payment-method`, {
      method: "PUT", body: JSON.stringify({ payment_method: paymentMethod }),
    }),
  createVnpay: (orderId) => request("vnpay/create", {
    method: "POST", body: JSON.stringify({ order_id: orderId }),
  }),
};
