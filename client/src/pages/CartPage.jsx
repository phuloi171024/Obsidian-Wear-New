import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import "./CartPage.css";
import { FiTrash2, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom"; 
import { cartService } from "../services/cartService"; 

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data.data);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; 

    try {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
      await cartService.updateQuantity(id, newQty);
    } catch (error) {
      alert("Lỗi khi cập nhật số lượng");
      fetchCart(); 
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Em có chắc muốn xóa sản phẩm này?")) return;
    try {
      await cartService.removeItem(id);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  const subTotal = cartItems.reduce((total, item) => {
    return total + item.product_variant.price * item.quantity;
  }, 0);

  const shippingFee = subTotal >= 500000 || subTotal === 0 ? 0 : 30000; 
  const grandTotal = subTotal + shippingFee;

  return (
    <>
      <div className="cart-page">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span className="active">Giỏ hàng</span>
        </div>

        <h1 className="cart-title">Giỏ hàng của bạn</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", fontSize: "1.2rem" }}>
            Đang tải dữ liệu giỏ hàng...
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-left">
              <div className="cart-header">
                <div>Sản phẩm</div>
                <div>Số lượng</div>
                <div>Thành tiền</div>
                <div>Xóa</div>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#666" }}>
                  Giỏ hàng của bạn đang trống.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="product">
                      <img
                        src={item.product_variant.product.image || "/images/quanshortthethao.png"}
                        alt={item.product_variant.product.name}
                      />
                      <div>
                        <h3>{item.product_variant.product.name}</h3>
                        <p>Size: {item.product_variant.size}</p>
                        <p>Màu: {item.product_variant.color}</p>
                        <span>{Number(item.product_variant.price).toLocaleString("vi-VN")} đ</span>
                      </div>
                    </div>

                    <div className="quantity">
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}>+</button>
                    </div>

                    <div className="total-price">
                      {(item.product_variant.price * item.quantity).toLocaleString("vi-VN")} đ
                    </div>

                    <FiTrash2
                      className="delete-icon"
                      onClick={() => handleRemove(item.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="cart-right">
              <div className="summary-card">
                <h2>Tổng đơn hàng</h2>

                <div className="summary-row">
                  <span>Tạm tính</span>
                  <b>{subTotal.toLocaleString("vi-VN")} đ</b>
                </div>

                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <b>{shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")} đ`}</b>
                </div>

                <hr />

                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <strong>{grandTotal.toLocaleString("vi-VN")} đ</strong>
                </div>

                <button 
                    className="checkout-btn"
                    disabled={cartItems.length === 0}
                    style={{ opacity: cartItems.length === 0 ? 0.5 : 1, cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Tiến hành thanh toán <FiArrowRight />
                </button>

                <Link to="/products" className="continue-btn" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
                  Tiếp tục mua sắm <FiShoppingCart style={{ marginLeft: '8px' }} />
                </Link>
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
        )}
      </div>

      <Footer />
    </>
  );
}