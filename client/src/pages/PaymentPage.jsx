import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast, { Toaster } from "react-hot-toast";

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState('cod');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const order = {
    code: 'ORD21751592',
    total: '1.920.000',
    method: 'Thanh toán khi nhận hàng (COD)',
  };

  // API ĐẶT HÀNG
  const handleConfirmOrder = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return navigate("/login");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          payment_method: activeTab
        })
      });

      const data = await res.json();
      if (res.ok && data.status) {
        toast.success("Đặt hàng thành công!");
        navigate('/order-success', { state: { order } });
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      toast.error("Không thể kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Giỏ hàng', icon: FaShoppingCart, status: 'done', href: '/cart' },
    { label: 'Thông tin giao hàng', icon: FaMapMarkerAlt, status: 'done', href: '/ShippingInfoPage' },
    { label: 'Thanh toán', icon: FaCheck, status: 'active', href: null },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <Toaster position="top-right" />
      <Header />

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
              <span>💵 Tiền mặt khi nhận hàng</span>
            </button>
            <button 
              onClick={() => setActiveTab('sepay')}
              className={`flex items-center space-x-2 pb-3 px-6 border-b-2 font-semibold text-sm transition-colors cursor-pointer ${activeTab === 'sepay' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <span>💳 Sepay</span>
            </button>
          </div>

          {/* Chi tiết phương thức COD */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-lg font-bold text-gray-900">
              <span>$</span>
              <h3>Thanh toán khi nhận hàng (COD)</h3>
            </div>

            <div className="space-y-2.5 text-sm">
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Mã đơn hàng:</span> {order.code}</p>
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Tổng tiền cần thanh toán:</span> <span className="text-red-500 font-bold text-base">{order.total} đ</span></p>
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Phương thức:</span> Thanh toán khi nhận hàng</p>
            </div>

            <div className="bg-amber-50/60 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs text-amber-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900 mb-1">
                <span>⚠️ Lưu ý quan trọng:</span>
              </div>
              <p>• Vui lòng chuẩn bị đúng số tiền khi nhận hàng</p>
              <p>• Kiểm tra kỹ sản phẩm trước khi thanh toán</p>
              <p>• Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc</p>
              <p>• Phí giao hàng đã được tính trong tổng số tiền</p>
            </div>

            <div className="bg-blue-50/60 border-l-4 border-blue-500 rounded-r-xl p-4 text-xs text-blue-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-blue-900 mb-1">
                <span>ℹ️ Quy trình giao hàng COD:</span>
              </div>
              <p>1. Nhân viên giao hàng sẽ liên hệ trước khi giao</p>
              <p>2. Bạn kiểm tra sản phẩm khi nhận hàng</p>
              <p>3. Thanh toán trực tiếp cho nhân viên giao hàng</p>
              <p>4. Nhận biên lai xác nhận thanh toán</p>
            </div>

            {/* Nút hành động */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm cursor-pointer"
              >
                <span>{loading ? "Đang xử lý..." : "✓ Xác nhận thanh toán COD"}</span>
              </button>

              <button
                onClick={() => navigate('/ShippingInfoPage')}
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