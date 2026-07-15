import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CheckoutPage.css";
import { FiDollarSign, FiCreditCard } from "react-icons/fi";

export default function CheckoutPage() {
  return (
    <>
      <Header />

      <div className="checkout-page">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Giỏ hàng</span>
          <span>/</span>
          <span className="active">Thanh toán</span>
        </div>

        <div className="payment-box">

          <h2>Phương thức thanh toán</h2>

          <div className="payment-tabs">
            <button className="active">
              <FiDollarSign />
              Tiền mặt khi nhận hàng
            </button>

            <button>
              <FiCreditCard />
              Sepay
            </button>
          </div>

          <div className="payment-content">

            <h3 className="cod-title">
              <FiDollarSign />
              Thanh toán khi nhận hàng (COD)
            </h3>

            <div className="order-info">
              <p>
                <strong>Mã đơn hàng:</strong> ORD21751592
              </p>

              <p>
                <strong>Tổng tiền cần thanh toán:</strong>
                <span className="checkout-price"> 629.000 đ</span>
              </p>

              <p>
                <strong>Phương thức:</strong> Thanh toán khi nhận hàng
              </p>
            </div>

            <div className="policy-card">

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

            </div>

            <button className="confirm-btn">
              ✓ Xác nhận thanh toán COD
            </button>

            <button className="back-btn">
              Quay lại chi tiết đơn hàng
            </button>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
