import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaMapMarkerAlt,
  FaCheck,
  FaSearch,
  FaRegUser,
  FaShoppingBag,
} from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

import Footer from "../components/Footer";

export default function ShippingInfoPage() {
  const navigate = useNavigate();

  // --- STATE FORM GIAO HÀNG ---
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState({});

  // ==========================================
  // [THÊM MỚI] STATE: LƯU TRỮ SỔ ĐỊA CHỈ
  // ==========================================
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // --- STATE GIỎ HÀNG (KẾT NỐI API) ---
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE MÃ GIẢM GIÁ (KẾT NỐI API) ---
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherTab, setVoucherTab] = useState("product"); 
  const [inputVoucher, setInputVoucher] = useState("");
  const [dbCoupons, setDbCoupons] = useState([]);
  const [appliedProductVoucher, setAppliedProductVoucher] = useState(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Lấy token bảo mật
  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token?.trim()}`
    };
  };

  // 1. GỌI API LẤY GIỎ HÀNG VÀ SỔ ĐỊA CHỈ
  useEffect(() => {
    const fetchCartAndAddresses = async () => {
      try {
        setLoading(true);
        // Chạy song song 2 API: Lấy giỏ hàng và Lấy sổ địa chỉ
        const [cartRes, addressRes] = await Promise.all([
          fetch("http://localhost:8000/api/cart", { headers: getHeaders() }),
          fetch("http://localhost:8000/api/user/addresses", { headers: getHeaders() })
        ]);

        // 1.1 Xử lý Giỏ hàng
        const cartData = await cartRes.json();
        if (cartRes.ok && cartData.success) {
          setCartItems(cartData.data);
        } else if (cartRes.status === 401) {
          navigate("/login");
          return;
        }

        // 1.2 Xử lý Sổ địa chỉ
        if (addressRes.ok) {
          const addressData = await addressRes.json();
          const addrs = addressData.data || [];
          
          if (addrs.length > 0) {
            // Sắp xếp ưu tiên địa chỉ mặc định lên đầu
            const sortedAddrs = addrs.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
            setSavedAddresses(sortedAddrs);

            // Tự động điền địa chỉ mặc định (hoặc địa chỉ đầu tiên) vào Form
            const defaultAddr = sortedAddrs[0];
            setSelectedAddressId(defaultAddr.id);
            setForm({
              name: defaultAddr.receiver_name || "",
              phone: defaultAddr.phone || "",
              // Gộp Số nhà, Tên đường, Phường, Quận vào ô Địa chỉ
              address: `${defaultAddr.street}, ${defaultAddr.ward}, ${defaultAddr.district}`,
              city: defaultAddr.province || "",
            });
          }
        }

      } catch (error) {
        toast.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra xem trang trước có lưu mã giảm giá không
    const savedVouchers = JSON.parse(localStorage.getItem("applied_vouchers"));
    if (savedVouchers) {
      if (savedVouchers.product) setAppliedProductVoucher(savedVouchers.product);
      if (savedVouchers.shipping) setAppliedShippingVoucher(savedVouchers.shipping);
    }

    fetchCartAndAddresses();
  }, [navigate]);

  // ==========================================
  // [THÊM MỚI] HÀM XỬ LÝ KHI CHỌN ĐỊA CHỈ TỪ DROPDOWN
  // ==========================================
  const handleSelectAddress = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);

    if (!id) {
      // Nếu khách hàng chọn "Nhập địa chỉ mới" -> Xóa trắng form
      setForm({ name: "", phone: "", address: "", city: "" });
      return;
    }

    // Tìm địa chỉ được chọn và tự động dán thông tin
    const addr = savedAddresses.find((a) => a.id.toString() === id);
    if (addr) {
      setForm({
        name: addr.receiver_name || "",
        phone: addr.phone || "",
        address: `${addr.street}, ${addr.ward}, ${addr.district}`,
        city: addr.province || "",
      });
      setErrors({}); // Xóa thông báo lỗi nếu có
    }
  };

  // 2. GỌI API LẤY DANH SÁCH MÃ TỪ DB
// 2. GỌI API LẤY DANH SÁCH MÃ TỪ DB (ĐÃ NÂNG CẤP BỘ LỌC)
  const fetchCoupons = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/coupons", { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        const now = new Date();
        
        // Lọc bỏ ngay các mã đã hết hạn, hết lượt hoặc bị khóa
        const validCoupons = data.data.filter(coupon => {
          // 1. Kiểm tra trạng thái đang hoạt động
          if (coupon.status === 0 || coupon.status === false) return false;
          
          // 2. Kiểm tra số lượt dùng (nếu có giới hạn)
          if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) return false;
          
          // 3. Kiểm tra ngày hết hạn
          if (coupon.expires_at) {
            const expiryDate = new Date(coupon.expires_at);
            if (expiryDate < now) return false;
          }
          
          return true; // Thỏa mãn hết các điều kiện thì mới cho phép hiển thị
        });

        // Chỉ lưu các mã còn hợp lệ vào state
        setDbCoupons(validCoupons); 
      }
    } catch (error) {
      console.error("Không thể tải danh sách mã giảm giá");
    }
  };

  // 3. API KIỂM TRA MÃ GIẢM GIÁ (ÁP DỤNG)
  const handleApplyCoupon = async () => {
    if (!inputVoucher.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      setIsApplying(true);
      const res = await fetch("http://localhost:8000/api/coupons/apply", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          code: inputVoucher,
          order_value: subtotal 
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        const couponData = data.data;

        if (couponData.type === "shipping") {
          setAppliedShippingVoucher(couponData);
        } else {
          setAppliedProductVoucher(couponData);
        }

        setInputVoucher("");
        setShowVoucherModal(false);
      } else {
        toast.error(data.message || "Mã giảm giá không hợp lệ!");
      }
    } catch (error) {
      toast.error("Không thể kết nối máy chủ!");
    } finally {
      setIsApplying(false);
    }
  };

  // --- XỬ LÝ FORM ĐIỀN THÔNG TIN ---
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Nếu user tự gõ thông tin, bỏ chọn dropdown "Sổ địa chỉ"
    setSelectedAddressId("");
  };

  // --- HÀM KIỂM TRA LỖI (VALIDATE) ---
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên người nhận";
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(form.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (Phải từ 9-11 số)";
    }
    
    if (!form.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ nhận hàng";
    }
    
    if (!form.city.trim()) {
      newErrors.city = "Vui lòng nhập tỉnh/thành phố";
    }
    
    return newErrors;
  };

  // --- TÍNH TOÁN TIỀN TỰ ĐỘNG ---
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product_variant?.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Phí vận chuyển: Mua >= 3 cái thì Freeship (0đ), ngược lại 30.000đ
  const baseShippingFee = cartItems.length > 0 ? (totalQuantity >= 3 ? 0 : 30000) : 0;
  
  // Tiền giảm giá
  const productDiscount = appliedProductVoucher ? appliedProductVoucher.discount_value : 0;
  const shippingDiscount = appliedShippingVoucher ? Math.min(appliedShippingVoucher.discount_value, baseShippingFee) : 0;

  const finalShippingFee = baseShippingFee - shippingDiscount;
  const total = Math.max(0, subtotal + finalShippingFee - productDiscount);

  // CHUYỂN TRANG THANH TOÁN
  const handleSubmit = () => {
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }
    
    localStorage.setItem("shipping_info", JSON.stringify(form));
    localStorage.setItem("applied_vouchers", JSON.stringify({
      product: appliedProductVoucher,
      shipping: appliedShippingVoucher
    }));

    navigate("/payment");
  };

  const steps = [
    { label: "Giỏ hàng", icon: FaShoppingCart, status: "done", href: "/cart" },
    { label: "Thông tin giao hàng", icon: FaMapMarkerAlt, status: "active", href: null },
    { label: "Thanh toán", icon: FaCheck, status: "pending", href: null },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      
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
            
            {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Thông tin giao hàng
              </h2>

              {/* ========================================== */}
              {/* [THÊM MỚI] GIAO DIỆN CHỌN SỔ ĐỊA CHỈ */}
              {/* ========================================== */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2" /> Chọn địa chỉ đã lưu (Sổ địa chỉ)
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={handleSelectAddress}
                    className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">-- Tạo một địa chỉ giao hàng mới --</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        [{addr.type}] {addr.receiver_name} - {addr.phone} - {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Họ tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Nhập họ tên người nhận"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="Nhập số điện thoại"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Địa chỉ chi tiết (Số nhà, Tên đường, Phường/Xã) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Nhập số nhà, tên đường, phường/xã..."
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.address
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={handleChange("city")}
                    placeholder="Nhập tỉnh/thành phố"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 transition ${
                      errors.city
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT ĐƠN HÀNG & MÃ GIẢM GIÁ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Giỏ Hàng <span className="text-gray-500 font-normal">({totalQuantity} Sản Phẩm)</span>
              </h2>

              {/* Danh sách sản phẩm API */}
              <div className="max-h-60 overflow-y-auto pr-2 mb-4 border-b border-gray-100">
                {loading ? (
                  <p className="text-sm text-center py-4">Đang tải...</p>
                ) : cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-50 last:border-0 last:mb-0">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={item.product_variant?.product?.thumbnail || "/images/placeholder.png"}
                          alt={item.product_variant?.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_variant?.product?.name}</p>
                        <p className="text-xs text-gray-400">Size: {item.product_variant?.size} - Số lượng: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {new Intl.NumberFormat('vi-VN').format(item.product_variant?.product?.price * item.quantity)} đ
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center py-4 text-gray-500">Giỏ hàng trống</p>
                )}
              </div>

              {/* TỔNG TIỀN TRƯỚC VOUCHER */}
              <div className="flex justify-between items-center mb-6">
                 <span className="text-gray-600 text-sm font-medium">Tổng tiền</span>
                 <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
              </div>

              {/* KHU VỰC ÁP DỤNG GIẢM GIÁ (GIỐNG GUARDIAN) */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Áp Dụng Giảm Giá</h3>
                  <button 
                    onClick={() => { setShowVoucherModal(true); fetchCoupons(); }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                  >
                    Mã Giảm Giá & Ưu Đãi Của Tôi <FiChevronRight />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nhập mã giảm giá của bạn" 
                    value={inputVoucher}
                    onChange={(e) => setInputVoucher(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplying}
                    className="bg-gray-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {isApplying ? "ĐANG XỬ LÝ" : "ÁP DỤNG"}
                  </button>
                </div>
              </div>

              {/* BẢNG TÍNH TIỀN CHUNG CUỘC */}
              <h3 className="text-sm font-bold text-gray-900 mb-3">Đơn Hàng Của Bạn</h3>
              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng sản phẩm đã chọn</span>
                  <span className="font-semibold text-gray-900">{totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                </div>
                <div className="flex justify-between flex-col">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển {totalQuantity >= 3 && <span className="text-green-600 font-semibold">(Freeship)</span>}</span>
                    <span className="font-semibold text-gray-900">{baseShippingFee === 0 ? "0đ" : `${new Intl.NumberFormat('vi-VN').format(baseShippingFee)}đ`}</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5">Giao Hàng Tiêu Chuẩn | Standard Delivery</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Mã giảm giá sản phẩm</span>
                    <span className="font-semibold">- {new Intl.NumberFormat('vi-VN').format(productDiscount)}đ</span>
                  </div>
                )}
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Mã giảm giá vận chuyển</span>
                    <span className="font-semibold">- {new Intl.NumberFormat('vi-VN').format(shippingDiscount)}đ</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="text-[10px] text-gray-400">*Đã bao gồm VAT</span>
                </div>
                <span className="text-xl font-bold text-red-500">{new Intl.NumberFormat('vi-VN').format(total)}đ</span>
              </div>

              {/* NÚT THANH TOÁN */}
              <button
                onClick={handleSubmit}
                className="w-full bg-[#f26522] hover:bg-[#e05515] text-white font-bold py-3.5 rounded-full transition shadow-md"
              >
                TIẾN HÀNH THANH TOÁN
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* POPUP MODAL MÃ GIẢM GIÁ TỪ TRANG CART */}
      {showVoucherModal && (
        <div className="voucher-modal-overlay">
          <div className="voucher-modal-box">
            <div className="voucher-modal-header">
              <h3>MÃ GIẢM GIÁ & ƯU ĐÃI</h3>
              <button className="close-btn" onClick={() => setShowVoucherModal(false)}>✕</button>
            </div>
            
            <div className="voucher-input-group">
              <input 
                type="text" 
                placeholder="Nhập mã giảm giá của bạn (VD: ROHTO40)" 
                value={inputVoucher}
                onChange={(e) => setInputVoucher(e.target.value)}
              />
              <button onClick={handleApplyCoupon} disabled={isApplying}>
                {isApplying ? "Đang ktra..." : "ÁP DỤNG"}
              </button>
            </div>

            <div className="voucher-tabs">
              <button className={voucherTab === "product" ? "active" : ""} onClick={() => setVoucherTab("product")}>
                Ưu Đãi Cho Bạn
              </button>
              <button className={voucherTab === "shipping" ? "active" : ""} onClick={() => setVoucherTab("shipping")}>
                Ưu Đãi Vận Chuyển
              </button>
            </div>

            <div className="voucher-list-container">
              {dbCoupons
                .filter(coupon => {
                  if (voucherTab === "shipping") return coupon.discount_type === "shipping";
                  return coupon.discount_type !== "shipping";
                })
                .map(coupon => {
                  const isSelected = voucherTab === "product" 
                    ? appliedProductVoucher?.id === coupon.id 
                    : appliedShippingVoucher?.id === coupon.id;
                  
                  return (
                    <div key={coupon.id} className={`voucher-card ${isSelected ? 'selected' : ''}`}>
                      <div className="voucher-icon">%</div>
                      <div className="voucher-info">
                        <h4>Mã: {coupon.code} - Giảm {Number(coupon.discount_value).toLocaleString('vi-VN')} {coupon.discount_type === 'percent' ? '%' : 'đ'}</h4>
                        <p>Đơn tối thiểu: {Number(coupon.min_order_value).toLocaleString('vi-VN')} đ</p>
                        <p>Hạn sử dụng: Đến {coupon.expires_at || "Không thời hạn"}</p>
                      </div>
                      <div className="voucher-action">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {
                            const formattedCoupon = {
                              id: coupon.id,
                              code: coupon.code,
                              discount_value: Number(coupon.discount_value),
                              type: coupon.discount_type === "shipping" ? "shipping" : "product"
                            };

                            if (!isSelected && subtotal < Number(coupon.min_order_value)) {
                                toast.error(`Đơn hàng chưa đạt tối thiểu ${Number(coupon.min_order_value).toLocaleString('vi-VN')} đ`);
                                return;
                            }

                            if (voucherTab === "product") {
                              setAppliedProductVoucher(isSelected ? null : formattedCoupon);
                            } else {
                              setAppliedShippingVoucher(isSelected ? null : formattedCoupon);
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              
              {dbCoupons.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Đang tải danh sách ưu đãi...</p>
              )}
            </div>
            
            <div className="voucher-modal-footer">
              <button className="confirm-voucher-btn" onClick={() => setShowVoucherModal(false)}>
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}