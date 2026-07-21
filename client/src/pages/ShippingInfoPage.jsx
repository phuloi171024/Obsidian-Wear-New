import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaMapMarkerAlt,
  FaCheck,
  FaSearch,
  FaRegUser,
  FaShoppingBag,
} from "react-icons/fa";
import Footer from "../components/Footer";

export default function ShippingInfoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên người nhận";
    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(form.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!form.city.trim()) newErrors.city = "Vui lòng nhập tỉnh/thành phố";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate("/payment");
  };

  // 1. Đã thêm "Sản Phẩm" vào ngay sau "Trang chủ" trong danh sách navLinks
  const navLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" }, 
    { label: "Quần", href: "/products" },
    { label: "Áo", href: "/products" },
    { label: "Túi", href: "/products" },
    { label: "Giày", href: "/products" },
  ];

  const steps = [
    { label: "Giỏ hàng", icon: FaShoppingCart, status: "done", href: "/cart" },
    { label: "Thông tin giao hàng", icon: FaMapMarkerAlt, status: "active", href: null },
    { label: "Thanh toán", icon: FaCheck, status: "pending", href: null },
  ];

  const orderItem = {
    name: "Quần Short Thể Thao",
    variant: "Size: S, Màu: Black",
    price: "1.920.000",
    image: "/quan-short.jpg",
  };

  const subtotal = "1.920.000";
  const shipping = "Miễn phí";
  const total = "1.920.000";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="Obsidian Wear" className="h-12 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-semibold tracking-wide text-gray-800 hover:text-indigo-600 transition"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-56">
              <FaSearch className="text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Bạn đang tìm kiếm gì ?"
                className="bg-transparent outline-none text-xs text-gray-600 placeholder-gray-400 w-full"
              />
            </div>
            
            {/* 2. Đã đổi thẻ <button> cũ thành <Link> để dẫn trực tiếp tới trang đăng nhập / đăng ký (Ví dụ: /login) */}
            <Link 
              to="/login" 
              aria-label="Tài khoản" 
              className="text-gray-700 hover:text-indigo-600 transition flex items-center"
            >
              <FaRegUser className="text-lg" />
            </Link>

            <Link to="/cart" aria-label="Giỏ hàng" className="text-gray-700 hover:text-indigo-600 transition">
              <FaShoppingBag className="text-lg" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
          <div className="text-sm text-gray-400 mb-2">
            <Link to="/" className="hover:text-gray-600">Trang chủ</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-500">Thông tin đặt hàng</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Thông tin đặt hàng
          </h1>

          <div className="flex items-center mb-10 max-w-xl">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = step.status === "done";
              const isActive = step.status === "active";
              const content = (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${
                      isDone || isActive ? "bg-indigo-600" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="text-sm" />
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      isDone || isActive ? "text-gray-900 font-medium" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
              return (
                <div key={step.label} className="flex items-center flex-1 last:flex-none">
                  {step.href ? (
                    <Link to={step.href} className="hover:opacity-80 transition">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 ${
                        isDone ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Thông tin giao hàng
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Họ tên người nhận
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Nhập họ tên người nhận"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.name
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="Nhập số điện thoại"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.phone
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Nhập địa chỉ nhận hàng"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.address
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={handleChange("city")}
                    placeholder="Nhập tỉnh/thành phố"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.city
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition mt-2"
                >
                  Tiến hành thanh toán
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Đơn hàng của bạn
              </h2>

              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={orderItem.image}
                    alt={orderItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{orderItem.name}</p>
                  <p className="text-xs text-gray-400">{orderItem.variant}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {orderItem.price} đ
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="text-gray-900">{subtotal} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-gray-900">{shipping}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-lg font-bold text-indigo-600">{total} đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}