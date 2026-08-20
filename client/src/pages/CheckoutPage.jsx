import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CheckoutPage.css";
import { FiDollarSign, FiCreditCard } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("cod"); // 'cod' hoặc 'sepay'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Thông tin đơn hàng mẫu (hoặc lấy từ state/localStorage)
  const orderInfo = {
    code: "ORD21751592",
    total: "629.000",
  };

  // Hàm gọi API xác nhận đặt hàng
  const handleConfirmOrder = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thực hiện thanh toán!");
      return navigate("/login");
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          payment_method: activeTab,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        toast.success("Đặt hàng thành công!");
        navigate("/order-success", {
          state: {
            order: {
              code: orderInfo.code,
              total: orderInfo.total,
              method:
                activeTab === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "Thanh toán qua Sepay",
            },
          },
        });
      } else {
        toast.error(data.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      toast.error("Không thể kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
  

      <div className="checkout-page">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Trang chủ
          </span>
          <span>/</span>
          <span onClick={() => navigate("/cart")} style={{ cursor: "pointer" }}>
            Giỏ hàng
          </span>
          <span>/</span>
          <span className="active">Thanh toán</span>
        </div>

        <div className="payment-box">
          <h2>Phương thức thanh toán</h2>

          {/* Payment Tabs */}
          <div className="payment-tabs">
            <button
              type="button"
              className={activeTab === "cod" ? "active" : ""}
              onClick={() => setActiveTab("cod")}
            >
              <FiDollarSign />
              Tiền mặt khi nhận hàng
            </button>

            <button
              type="button"
              className={activeTab === "sepay" ? "active" : ""}
              onClick={() => setActiveTab("sepay")}
            >
              <FiCreditCard />
              Sepay
            </button>
          </div>

          <div className="payment-content">
            <h3 className="cod-title">
              {activeTab === "cod" ? <FiDollarSign /> : <FiCreditCard />}
              {activeTab === "cod"
                ? "Thanh toán khi nhận hàng (COD)"
                : "Thanh toán Chuyển khoản (Sepay)"}
            </h3>

            <div className="order-info">
              <p>
                <strong>Mã đơn hàng:</strong> {orderInfo.code}
              </p>

              <p>
                <strong>Tổng tiền cần thanh toán:</strong>
                <span className="checkout-price"> {orderInfo.total} đ</span>
              </p>

              <p>
                <strong>Phương thức:</strong>{" "}
                {activeTab === "cod"
                  ? "Thanh toán khi nhận hàng"
                  : "Chuyển khoản qua Sepay"}
              </p>
            </div>

            <div className="policy-card">
              {activeTab === "cod" ? (
                <>
                  <div className="note-box warning">
                    <h4>ⓘ Lưu ý quan trọng:</h4>
                    <ul>
                      <li>Vui lòng chuẩn bị đúng số tiền khi nhận hàng.</li>
                      <li>Kiểm tra kỹ sản phẩm trước khi thanh toán.</li>
                      <li>Đơn hàng sẽ được giao trong vòng 2–3 ngày làm việc.</li>
                      <li>Phí giao hàng đã được tính vào tổng tiền.</li>
                    </ul>
                  </div>

                  <div className="note-box info">
                    <h4>ⓘ Quy trình giao hàng COD:</h4>
                    <ol>
                      <li>Nhân viên giao hàng sẽ liên hệ trước khi giao.</li>
                      <li>Bạn kiểm tra sản phẩm khi nhận hàng.</li>
                      <li>Thanh toán trực tiếp cho nhân viên giao hàng.</li>
                      <li>Nhận biên lai xác nhận thanh toán.</li>
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <div className="note-box info">
                    <h4>ⓘ Hướng dẫn thanh toán Sepay:</h4>
                    <ul>
                      <li>
                        Hệ thống sẽ ghi nhận tự động sau khi chuyển khoản thành công.
                      </li>
                      <li>Vui lòng giữ nguyên nội dung chuyển khoản mã đơn hàng.</li>
                      <li>Đơn hàng sẽ được chuyển sang trạng thái đã thanh toán.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className="confirm-btn"
              onClick={handleConfirmOrder}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: "pointer" }}
            >
              {loading
                ? "Đang xử lý..."
                : activeTab === "cod"
                ? "✓ Xác nhận thanh toán COD"
                : "✓ Xác nhận thanh toán Sepay"}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/shipping-info")}
              style={{ cursor: "pointer" }}
            >
              Quay lại chi tiết đơn hàng
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}