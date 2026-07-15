import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CartPage.css";
import { FiTrash2, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  return (
    <>
      <Header />

      <div className="cart-page">

        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="active">Giỏ hàng</span>
        </div>

        <h1 className="cart-title">Giỏ hàng của bạn</h1>

        <div className="cart-container">

          {/* LEFT */}

          <div className="cart-left">

            <div className="cart-header">

              <div>Sản phẩm</div>

              <div>Số lượng</div>

              <div>Thành tiền</div>

              <div>Xóa</div>

            </div>

            <div className="cart-item">

              <div className="product">

                <img
                  src="/src/public/images/quanshortthethao.png"
                  alt=""
                />

                <div>

                  <h3>Quần Short Thể Thao</h3>

                  <p>Size: S</p>

                  <p>Màu: Brown</p>

                  <span>599.000 đ</span>

                </div>

              </div>

              <div className="quantity">

                <button>-</button>

                <span>1</span>

                <button>+</button>

              </div>

              <div className="total-price">

                599.000 đ

              </div>

              <FiTrash2 className="delete-icon"/>

            </div>

          </div>

          {/* RIGHT */}

          <div className="cart-right">

            <div className="summary-card">

              <h2>Tổng đơn hàng</h2>

              <div className="summary-row">

                <span>Tạm tính</span>

                <b>599.000 đ</b>

              </div>

              <div className="summary-row">

                <span>Phí vận chuyển</span>

                <b>30.000 đ</b>

              </div>

              <hr/>

              <div className="summary-row total">

                <span>Tổng cộng</span>

                <strong>629.000 đ</strong>

              </div>

              <button
  className="checkout-btn"
  onClick={() => navigate("/checkout")}
>
  Tiến hành thanh toán
  <FiArrowRight />
</button>

              <button className="continue-btn">

                Tiếp tục mua sắm

                <FiShoppingCart/>

              </button>

            </div>

            <div className="policy-card">

              <h3>Chính sách mua hàng</h3>

              <ul>

                <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</li>

                <li>Đổi trả miễn phí trong vòng 30 ngày</li>

                <li>Hỗ trợ bảo hành 1 năm cho sản phẩm chính hãng</li>

              </ul>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
