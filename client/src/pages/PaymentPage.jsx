import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast, { Toaster } from "react-hot-toast";

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState({
    total: '0',
    rawTotal: 0,
    method: 'Thanh toán khi nhận hàng (COD)',
  });
  const navigate = useNavigate();

  // State quản lý Ghi chú đơn hàng
  const [note, setNote] = useState("");

  // SỬA LẠI HÀM NÀY ĐỂ TÍNH TIỀN GỒM CẢ PHÍ SHIP VÀ MÃ GIẢM GIÁ
  useEffect(() => {
    const fetchCartAndOrderInfo = async () => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/api/cart", {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token.trim()}`
          }
        });
        const data = await res.json();
        
        if (res.ok && data.success && Array.isArray(data.data)) {
          // 1. Tính tổng tiền hàng gốc
          const subtotal = data.data.reduce((sum, item) => {
            const price = item.product_variant?.product?.price || item.product_variant?.price || 0;
            return sum + (price * item.quantity);
          }, 0);

          // 2. Tính số lượng để ra phí ship (Giống y hệt CartPage)
          const totalQuantity = data.data.reduce((sum, item) => sum + item.quantity, 0);
          const baseShippingFee = data.data.length > 0 ? (totalQuantity >= 3 ? 0 : 30000) : 0;

          // 3. Lấy mã giảm giá từ LocalStorage để trừ đi
          const appliedVouchers = JSON.parse(localStorage.getItem("applied_vouchers") || "{}");
          const productDiscount = appliedVouchers.product ? Number(appliedVouchers.product.discount_value) : 0;
          const shippingDiscount = appliedVouchers.shipping ? Math.min(Number(appliedVouchers.shipping.discount_value), baseShippingFee) : 0;

          // 4. Tính tổng tiền cuối cùng (Giá gốc + Ship - Giảm giá)
          const finalShippingFee = baseShippingFee - shippingDiscount;
          const finalTotal = Math.max(0, subtotal + finalShippingFee - productDiscount);

          const formattedTotal = Number(finalTotal).toLocaleString('vi-VN');

          setOrder(prev => ({
            ...prev,
            total: formattedTotal,     // Hiển thị ra màn hình (VD: 370.000)
            rawTotal: Number(finalTotal), // Đẩy xuống DB cho Backend
          }));
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin giỏ hàng:", error);
      }
    };

    fetchCartAndOrderInfo();
  }, []);

// API ĐẶT HÀNG VÀ THANH TOÁN
  const handleConfirmOrder = async () => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return navigate("/login");
    }

    if (order.rawTotal <= 0) {
      toast.error("Giỏ hàng của bạn đang trống hoặc tổng tiền không hợp lệ!");
      return;
    }

    //  Lấy ID địa chỉ từ LocalStorage 
    const addressId = localStorage.getItem("selected_address_id");
    const appliedVouchers = JSON.parse(localStorage.getItem("applied_vouchers") || "{}");
    // Lấy ID của voucher sản phẩm 
    const couponId = appliedVouchers.product?.id || appliedVouchers.shipping?.id || null;

    try {
      setLoading(true);
      
      // 1. LUÔN LUÔN LƯU ĐƠN HÀNG VÀO DATABASE TRƯỚC
     const orderRes = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          payment_method: activeTab,
          total_price: order.rawTotal,
          address_id: addressId || null, 
          note: note,   
          coupon_id: couponId                  
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.status) {
        // Bắt riêng lỗi 400 (Giỏ hàng trống do đã bấm tạo đơn trước đó)
        if (orderRes.status === 400) {
          toast.error("Đơn hàng đã được ghi nhận trước đó hoặc giỏ hàng rỗng!");
          toast.success("Đang đưa bạn đến danh sách đơn hàng...", { duration: 3000 });
          setLoading(false);
          setTimeout(() => {
            navigate("/orders"); // Chuyển khách về trang Lịch sử đơn hàng
          }, 1500);
          return;
        }

        toast.error(orderData.message || "Có lỗi xảy ra khi tạo đơn hàng, vui lòng thử lại!");
        setLoading(false);
        return;
      }
      
      const realOrderId = orderData.order_id;
      
      // 2. XỬ LÝ THEO PHƯƠNG THỨC THANH TOÁN
      if (activeTab === 'sepay' || activeTab === 'vnpay') {
        // GỌI API TẠO LINK VNPAY VỚI ID ĐƠN HÀNG THẬT
        const vnpayRes = await fetch("http://localhost:8000/api/vnpay/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token.trim()}`
          },
          body: JSON.stringify({
            amount: order.rawTotal,
            order_id: realOrderId // Truyền ID thật vào VNPay
          })
        });

        const vnpayData = await vnpayRes.json();
        
        if (vnpayRes.ok && (vnpayData.success || vnpayData.status)) {
          const redirectUrl = vnpayData.data || vnpayData.url;
          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }
        }
        toast.error("Không thể tạo liên kết thanh toán VNPay!");
        
      } else {
        // NẾU LÀ COD -> CHUYỂN HƯỚNG SANG TRANG THÀNH CÔNG LUÔN
        toast.success("Đặt hàng thành công!");
        setTimeout(() => {
          navigate(`/order-success?order_id=${realOrderId}`, { state: { order: { ...order, code: realOrderId } } });
        }, 1000);
      }

    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Giỏ hàng', icon: FaShoppingCart, status: 'done', href: '/cart' },
    { label: 'Thông tin giao hàng', icon: FaMapMarkerAlt, status: 'done', href: '/shipping-info' }, // ĐÃ SỬA THÀNH '/shipping-info'
    { label: 'Thanh toán', icon: FaCheck, status: 'active', href: null },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <Toaster position="top-right" />
      
      {/* ================= MAIN CONTENT SECTION ================= */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-2">
          <Link to="/" className="hover:text-gray-600">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-500">Thanh toán</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thông tin đặt hàng</h1>

        {/* ================= STEP INDICATOR ================= */}
        <div className="flex items-center mb-8 max-w-xl">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = step.status === 'done';
            const isActive = step.status === 'active';
            const content = (
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${
                    isDone || isActive ? 'bg-indigo-600' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="text-sm" />
                </div>
                <span
                  className={`text-sm whitespace-nowrap ${
                    isDone || isActive ? 'text-indigo-600 font-semibold' : 'text-gray-400'
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
                      isDone ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
          
          {/* Tabs Thanh toán */}
          <div className="flex border-b border-gray-200 mb-8">
            <button 
              onClick={() => setActiveTab('cod')}
              className={`flex items-center space-x-2 pb-3 px-2 border-b-2 font-semibold text-sm transition-colors cursor-pointer ${activeTab === 'cod' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <span>COD</span>
            </button>
            <button 
              onClick={() => setActiveTab('sepay')}
              className={`flex items-center space-x-2 pb-3 px-6 border-b-2 font-semibold text-sm transition-colors cursor-pointer ${activeTab === 'sepay' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <span>VNPay</span>
            </button>
          </div>

          {/* Chi tiết phương thức (Hiển thị động theo Tab) */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-lg font-bold text-gray-900">
              <span>$</span>
              <h3>{activeTab === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán trực tuyến (VNPay)'}</h3>
            </div>

            {/* ĐÃ XÓA DÒNG MÃ ĐƠN HÀNG ẢO (ORD...) TẠI ĐÂY */}
            <div className="space-y-2.5 text-sm">
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Tổng tiền cần thanh toán:</span> <span className="text-red-500 font-bold text-base">{order.total} đ</span></p>
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Phương thức:</span> {activeTab === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản / Quét mã VNPay'}</p>
            </div>

            {/* Đổi nội dung hướng dẫn tùy theo Tab */}
            {activeTab === 'cod' ? (
              <>
                <div className="bg-amber-50/60 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs text-amber-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900 mb-1">
                    <span> Lưu ý quan trọng:</span>
                  </div>
                  <p>• Vui lòng chuẩn bị đúng số tiền khi nhận hàng</p>
                  <p>• Kiểm tra kỹ sản phẩm trước khi thanh toán</p>
                  <p>• Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc</p>
                  <p>• Phí giao hàng đã được tính trong tổng số tiền</p>
                </div>

                <div className="bg-blue-50/60 border-l-4 border-blue-500 rounded-r-xl p-4 text-xs text-blue-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-blue-900 mb-1">
                    <span>Quy trình giao hàng COD:</span>
                  </div>
                  <p>1. Nhân viên giao hàng sẽ liên hệ trước khi giao</p>
                  <p>2. Bạn kiểm tra sản phẩm khi nhận hàng</p>
                  <p>3. Thanh toán trực tiếp cho nhân viên giao hàng</p>
                  <p>4. Nhận biên lai xác nhận thanh toán</p>
                </div>
              </>
            ) : (
              <div className="bg-blue-50/60 border-l-4 border-blue-500 rounded-r-xl p-4 text-xs text-blue-800 space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-blue-900 mb-1">
                  <span> Thông tin thanh toán trực tuyến:</span>
                </div>
                <p>• Bạn sẽ được chuyển hướng sang cổng thanh toán bảo mật của VNPay.</p>
                <p>• Hỗ trợ thanh toán qua thẻ ATM nội địa, thẻ Visa/Mastercard hoặc quét mã QR ứng dụng ngân hàng.</p>
                <p>• Hệ thống sẽ tự động xác nhận đơn hàng sau khi bạn thanh toán thành công.</p>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Ghi chú đơn hàng (Không bắt buộc)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows="3"
                placeholder="Ví dụ: Giao hàng vào giờ hành chính, gọi trước khi giao..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            {/* Nút hành động */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm cursor-pointer"
              >
                <span>{loading ? "Đang xử lý..." : activeTab === 'cod' ? "✓ Xác nhận thanh toán COD" : "✓ Thanh toán qua VNPay"}</span>
              </button>

              <button
                onClick={() => navigate('/shipping-info')} // ĐÃ SỬA THÀNH '/shipping-info'
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Quay lại chi tiết đơn hàng
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}