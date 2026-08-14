import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiClipboard, FiLock, FiLogOut, FiEye, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "Khách hàng", email: "" });
  const [orders, setOrders] = useState([]);
  // State quản lý hiển thị Modal chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================
  // STATE: ĐỔI MẬT KHẨU (ĐÃ ĐƯỢC CHUYỂN VÀO BÊN TRONG HÀM)
  // =====================================
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token?.trim()}`
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/orders", { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.status) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem lịch sử đơn hàng!");
      navigate("/login");
      return;
    }

    const savedUser = localStorage.getItem("user_info");
    if (savedUser) {
      try {
        setUserInfo(JSON.parse(savedUser));
      } catch (e) { console.error(e); }
    }

    fetchOrders();
  }, [navigate]);

  
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.new_password_confirmation) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (pwdForm.new_password.length < 8) {
      toast.error("Mật khẩu mới phải từ 8 ký tự trở lên!");
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      setIsSubmittingPwd(true);
      const res = await fetch("http://localhost:8000/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify(pwdForm)
      });
      const data = await res.json();
      
      if (res.ok && (data.status || data.success)) {
        toast.success("Đổi mật khẩu thành công!");
        setShowPwdModal(false);
        setPwdForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      } else {
        toast.error(data.message || "Mật khẩu cũ không chính xác!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />


      <div className="orders-page">
        <div className="account-layout">
          {/* Sidebar */}
          <div className="account-sidebar">
            <h2>Tài khoản của tôi</h2>
            <div className="user-info">
              <div className="avatar">
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "K"}
              </div>
              <div>
                <h4>{userInfo?.name || "Khách hàng"}</h4>
                <span>{userInfo?.email || "Chưa cập nhật email"}</span>
              </div>
            </div>

            <ul className="account-menu">
              <li><Link to="/profile"><FiUser /> Thông tin cá nhân</Link></li>
              <li className="active"><Link to="/orders"><FiClipboard /> Đơn hàng của tôi</Link></li>
              <li onClick={() => setShowPwdModal(true)} style={{ cursor: "pointer" }}><FiLock /> Đổi mật khẩu</li>
              <li className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}><FiLogOut /> Đăng xuất</li>
            </ul>
          </div>

          {/* Content */}
          <div className="orders-content">
            <div className="orders-header">
              <h2 className="orders-title"><FiClipboard /> Đơn hàng của tôi</h2>
              <a href="#" onClick={(e) => { e.preventDefault(); fetchOrders(); toast.success("Đã làm mới danh sách!"); }}>Làm mới</a>
            </div>

            {loading ? (
              <p style={{ textAlign: "center", padding: "30px" }}>Đang tải lịch sử đơn hàng...</p>
            ) : orders.length === 0 ? (
              <p style={{ textAlign: "center", padding: "30px", color: "#666" }}>Bạn chưa có đơn hàng nào.</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                      <td className="price">{new Intl.NumberFormat('vi-VN').format(order.total_amount)} đ</td>
                      <td>
                        <span className={`status ${order.status}`}>
                          {order.status === 'pending' ? 'Chờ xử lý' : order.status}
                        </span>
                      </td>
                    <td>
    {/* Khi bấm vào sẽ lưu thông tin đơn hàng đó vào state selectedOrder */}
    <button className="view-btn" onClick={() => setSelectedOrder(order)}>
      <FiEye />
    </button>
  </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    {/* ==========================================
          MODAL: CHI TIẾT ĐƠN HÀNG (ĐÃ CÓ SẢN PHẨM)
      ========================================== */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", position: "relative", display: "flex", flexDirection: "column" }}>
            
            {/* Nút Đóng */}
            <button 
              onClick={() => setSelectedOrder(null)} 
              style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}
            >
              <FiX />
            </button>
            
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              Chi tiết đơn hàng #{selectedOrder.id}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", marginBottom: "15px" }}>
              <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")}</p>
              <p><strong>Trạng thái:</strong> <span className={`status ${selectedOrder.status}`}>{selectedOrder.status === 'pending' ? 'Chờ xử lý' : selectedOrder.status}</span></p>
              <p><strong>Tổng thanh toán:</strong> <span style={{ color: "red", fontWeight: "bold" }}>{new Intl.NumberFormat('vi-VN').format(selectedOrder.total_amount)} đ</span></p>
            </div>

            {/* KHU VỰC HIỂN THỊ DANH SÁCH SẢN PHẨM */}
            <h4 style={{ fontSize: "15px", marginBottom: "10px", color: "#374151" }}>Sản phẩm đã mua:</h4>
            
            <div style={{ overflowY: "auto", paddingRight: "5px", flex: 1, border: "1px solid #eee", borderRadius: "8px", padding: "10px", background: "#fafafa" }}>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => {
                  // Truy xuất dữ liệu sản phẩm từ API trả về
                  const variant = item.product_variant;
                  const product = variant?.product;
                  
                  return (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px 0", borderBottom: index < selectedOrder.items.length - 1 ? "1px dashed #d1d5db" : "none" }}>
                      
                      {/* Hình ảnh sản phẩm */}
                      <img 
                        src={product?.thumbnail || "https://placehold.co/60"} 
                        alt={product?.name} 
                        style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee", background: "#fff" }} 
                      />
                      
                      {/* Thông tin sản phẩm */}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 5px 0", fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>
                          {product?.name || "Sản phẩm không xác định"}
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                          Phân loại: {variant?.color} - Size {variant?.size}
                        </p>
                        <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#374151" }}>
                          Số lượng: <strong>x{item.quantity}</strong>
                        </p>
                      </div>
                      
                      {/* Giá tiền 1 sản phẩm */}
                      <div style={{ fontWeight: "bold", color: "#ef4444", fontSize: "14px" }}>
                        {new Intl.NumberFormat('vi-VN').format(item.price)} đ
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: "center", color: "#6b7280", margin: "20px 0" }}>Không có thông tin sản phẩm.</p>
              )}
            </div>

            <button 
              onClick={() => setSelectedOrder(null)} 
              style={{ width: "100%", background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {/* ==========================================
          MODAL: ĐỔI MẬT KHẨU
      ========================================== */}
      {showPwdModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "400px", position: "relative" }}>
            <button onClick={() => setShowPwdModal(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}><FiX /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px" }}>Đổi mật khẩu</h3>
            
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Mật khẩu hiện tại *</label>
                <input type="password" required value={pwdForm.current_password} onChange={(e) => setPwdForm({...pwdForm, current_password: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Mật khẩu mới *</label>
                <input type="password" required minLength={8} value={pwdForm.new_password} onChange={(e) => setPwdForm({...pwdForm, new_password: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>Xác nhận mật khẩu mới *</label>
                <input type="password" required minLength={8} value={pwdForm.new_password_confirmation} onChange={(e) => setPwdForm({...pwdForm, new_password_confirmation: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }} />
              </div>
              <button disabled={isSubmittingPwd} type="submit" style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", opacity: isSubmittingPwd ? 0.7 : 1 }}>
                {isSubmittingPwd ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}