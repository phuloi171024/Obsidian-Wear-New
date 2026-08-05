import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CartPage.css";
import { FiTrash2, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý hiển thị Popup xác nhận xóa
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token?.trim()}`
    };
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/cart", { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setCartItems(data.data);
      } else {
        if (res.status === 401) navigate("/login");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch(`http://localhost:8000/api/cart/update/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (res.ok) {
        setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
      }
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  // Kích hoạt mở Popup khi bấm nút xóa
  const promptRemove = (id) => {
    setItemToDelete(id);
    setShowModal(true);
  };

  // Xác nhận xóa thực sự trong Popup
  const confirmRemove = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`http://localhost:8000/api/cart/remove/${itemToDelete}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setCartItems(cartItems.filter(item => item.id !== itemToDelete));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setShowModal(false);
      setItemToDelete(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product_variant?.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const shippingFee = cartItems.length > 0 ? 30000 : 0;
  const total = subtotal + shippingFee;

  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <div className="cart-page">
        <div className="breadcrumb">
          <span onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>Trang chủ</span>
          <span>/</span>
          <span className="active">Giỏ hàng</span>
        </div>

        <h1 className="cart-title">Giỏ hàng của bạn</h1>

        <div className="cart-container">
          <div className="cart-left">
            <div className="cart-header">
              <div>Sản phẩm</div>
              <div>Số lượng</div>
              <div>Thành tiền</div>
              <div>Xóa</div>
            </div>

            {loading ? (
              <p style={{ padding: "40px", textAlign: "center" }}>Đang tải giỏ hàng...</p>
            ) : cartItems.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "12px" }}>
                <p style={{ color: "#777", marginBottom: "20px" }}>Giỏ hàng của bạn đang trống.</p>
                <button onClick={() => navigate("/products")} className="continue-btn" style={{ maxWidth: "200px", margin: "0 auto" }}>
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="product">
                    <img
                      src={item.product_variant?.product?.thumbnail || "https://placehold.co/100"}
                      alt={item.product_variant?.product?.name}
                    />
                    <div>
                      <h3>{item.product_variant?.product?.name}</h3>
                      <p>Size: {item.product_variant?.size}</p>
                      <p>Màu: {item.product_variant?.color}</p>
                      <span>{new Intl.NumberFormat('vi-VN').format(item.product_variant?.product?.price)} đ</span>
                    </div>
                  </div>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="total-price">
                    {new Intl.NumberFormat('vi-VN').format(item.product_variant?.product?.price * item.quantity)} đ
                  </div>
                  <FiTrash2 className="delete-icon" onClick={() => promptRemove(item.id)} />
                </div>
              ))
            )}
          </div>

          <div className="cart-right">
            <div className="summary-card">
              <h2>Tổng đơn hàng</h2>
              <div className="summary-row">
                <span>Tạm tính</span>
                <b>{new Intl.NumberFormat('vi-VN').format(subtotal)} đ</b>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <b>{new Intl.NumberFormat('vi-VN').format(shippingFee)} đ</b>
              </div>
              <hr />
              <div className="summary-row total">
                <span>Tổng cộng</span>
                <strong>{new Intl.NumberFormat('vi-VN').format(total)} đ</strong>
              </div>
              
              <button
                className="checkout-btn"
                onClick={() => navigate("/shipping-info")}
                disabled={cartItems.length === 0}
                style={{ opacity: cartItems.length === 0 ? 0.5 : 1 }}
              >
                Tiến hành thanh toán <FiArrowRight />
              </button>
              
              <button className="continue-btn" onClick={() => navigate("/products")}>
                Tiếp tục mua sắm <FiShoppingCart />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP XÁC NHẬN XÓA SẢN PHẨM */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <h3>Xác nhận xóa sản phẩm</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?</p>
            <div className="custom-modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Hủy bỏ
              </button>
              <button className="btn-confirm" onClick={confirmRemove}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}