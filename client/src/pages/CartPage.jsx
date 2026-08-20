import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CartPage.css";
import { FiTrash2, FiShoppingCart, FiArrowRight, FiTag } from "react-icons/fi";
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

  // --- STATE QUẢN LÝ MÃ GIẢM GIÁ (KẾT NỐI API) ---
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherTab, setVoucherTab] = useState("product"); // "product" | "shipping"
  const [inputVoucher, setInputVoucher] = useState("");
  
  // Lưu danh sách mã lấy từ Database
  const [dbCoupons, setDbCoupons] = useState([]);
  
  // Lưu thông tin mã đã áp dụng
  const [appliedProductVoucher, setAppliedProductVoucher] = useState(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token?.trim()}`
    };
  };

  // 1. LẤY GIỎ HÀNG
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

  // 2. LẤY DANH SÁCH MÃ GIẢM GIÁ TỪ DATABASE
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

 const updateQuantity = async (id, newQuantity) => {
  if (newQuantity < 1) return;

  try {
    const res = await fetch(
      `http://localhost:8000/api/cart/update/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      },
    );

    const data = await res.json();

    if (res.ok && data.success) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? data.data
            : item,
        ),
      );

      toast.success(data.message);
      return;
    }

    toast.error(
      data.message || "Không thể cập nhật số lượng",
    );
  } catch (error) {
    toast.error("Không thể kết nối đến máy chủ");
  }
};

  const promptRemove = (id) => {
    setItemToDelete(id);
    setShowModal(true);
  };

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
        
        if (cartItems.length === 1) {
            setAppliedProductVoucher(null);
            setAppliedShippingVoucher(null);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setShowModal(false);
      setItemToDelete(null);
    }
  };

  // --- TÍNH TOÁN TIỀN TỰ ĐỘNG ---
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product_variant?.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Phí vận chuyển: Mua >= 3 cái thì Freeship (0đ), ngược lại 30.000đ
  const baseShippingFee = cartItems.length > 0 ? (totalQuantity >= 3 ? 0 : 30000) : 0;

  // --- HÀM GỌI API KIỂM TRA MÃ KHI GÕ THỦ CÔNG ---
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
      toast.error("Không thể kết nối đến máy chủ kiểm tra mã!");
    } finally {
      setIsApplying(false);
    }
  };
  
  // Tiền giảm giá sản phẩm
  const productDiscount = appliedProductVoucher ? appliedProductVoucher.discount_value : 0;
  
  // Tiền giảm phí ship (không vượt quá phí ship thực tế)
  const shippingDiscount = appliedShippingVoucher ? Math.min(appliedShippingVoucher.discount_value, baseShippingFee) : 0;

  const finalShippingFee = baseShippingFee - shippingDiscount;
  const total = Math.max(0, subtotal + finalShippingFee - productDiscount);

  const handleProceedToCheckout = () => {
      localStorage.setItem("applied_vouchers", JSON.stringify({
        product: appliedProductVoucher,
        shipping: appliedShippingVoucher
      }));
      navigate("/shipping-info");
  };

  return (
    <>
      <Toaster position="top-right" />
    

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
              
              {/* Nút bấm chọn Mã Giảm Giá */}
              {cartItems.length > 0 && (
                <div 
                  className="voucher-trigger"
                  onClick={() => {
                    setShowVoucherModal(true);
                    fetchCoupons(); // Gọi API lấy mã giảm giá khi mở Modal
                  }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8faff', borderRadius: '8px', border: '1px dashed #c3d4ff', cursor: 'pointer', marginBottom: '20px', transition: '0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
                    <FiTag /> Mã giảm giá / Ưu đãi
                  </div>
                  <div style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>
                    {(appliedProductVoucher || appliedShippingVoucher) ? "Đã áp dụng mã" : "Chọn mã"}
                  </div>
                </div>
              )}

              <div className="summary-row">
                <span>Tạm tính</span>
                <b>{new Intl.NumberFormat('vi-VN').format(subtotal)} đ</b>
              </div>
              
              <div className="summary-row">
                <span>Phí vận chuyển {totalQuantity >= 3 && <span style={{ fontSize: '11px', color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Freeship</span>}</span>
                <b>{baseShippingFee === 0 ? "Miễn phí" : `${new Intl.NumberFormat('vi-VN').format(baseShippingFee)} đ`}</b>
              </div>

              {/* Dòng hiển thị giảm giá sản phẩm */}
              {productDiscount > 0 && (
                <div className="summary-row" style={{ color: '#16a34a' }}>
                  <span>Giảm giá ({appliedProductVoucher?.code})</span>
                  <b>- {new Intl.NumberFormat('vi-VN').format(productDiscount)} đ</b>
                </div>
              )}

              {/* Dòng hiển thị giảm phí vận chuyển */}
              {shippingDiscount > 0 && (
                <div className="summary-row" style={{ color: '#16a34a' }}>
                  <span>Giảm ship ({appliedShippingVoucher?.code})</span>
                  <b>- {new Intl.NumberFormat('vi-VN').format(shippingDiscount)} đ</b>
                </div>
              )}

              <hr />
              <div className="summary-row total">
                <span>Tổng cộng</span>
                <strong>{new Intl.NumberFormat('vi-VN').format(total)} đ</strong>
              </div>
              
              <button
                className="checkout-btn"
                onClick={handleProceedToCheckout}
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

      {/* POPUP MODAL MÃ GIẢM GIÁ */}
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
              {/* Render danh sách Coupon từ Database */}
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
                      <div className="voucher-icon">
                         %
                      </div>
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

                            // Check min order value trực tiếp tại Frontend trước khi check
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