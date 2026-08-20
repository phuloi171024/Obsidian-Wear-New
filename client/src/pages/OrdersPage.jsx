import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiClipboard, FiLock, FiLogOut, FiEye, FiX, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";


export default function OrdersPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "Khách hàng", email: "" });
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
const [confirmCancelId, setConfirmCancelId] = useState(null);
  // THÊM STATE: Quản lý bộ lọc và trạng thái loading khi hủy đơn
  const [filterStatus, setFilterStatus] = useState("all");
  const [cancelingId, setCancelingId] = useState(null);

  // STATE: ĐỔI MẬT KHẨU
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

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch("http://localhost:8000/api/logout", {
          method: "POST",
          headers: getHeaders()
        });
      } catch (error) {
        console.error("Lỗi mạng khi đăng xuất:", error);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    toast.success("Đăng xuất thành công!");
    navigate("/");
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

    try {
      setIsSubmittingPwd(true);
      const res = await fetch("http://localhost:8000/api/user/password", {
        method: "PUT",
        headers: getHeaders(),
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

  // THÊM: HÀM HỦY ĐƠN HÀNG
  const executeCancelOrder = async () => {
    if (!confirmCancelId) return;
    
    try {
      setCancelingId(confirmCancelId);
      const res = await fetch(`http://localhost:8000/api/orders/${confirmCancelId}/cancel`, {
        method: "PUT",
        headers: getHeaders()
      });
      
      const data = await res.json();
      if (res.ok && (data.status || data.success)) {
        toast.success("Đã hủy đơn hàng thành công!");
        setOrders(orders.map(o => o.id === confirmCancelId ? { ...o, status: 'cancelled' } : o));
      } else {
        toast.error(data.message || "Không thể hủy đơn hàng này!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setCancelingId(null);
      setConfirmCancelId(null); // Tắt popup sau khi gọi xong
    }
  };

  // THÊM: LỌC MẢNG ĐƠN HÀNG TRƯỚC KHI HIỂN THỊ
  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  // Hàm helper để dịch trạng thái
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'shipped': return 'Đang giao';
      case 'completed': return 'Hoàn tất';
      case 'cancelled': return 'Đã hủy';
      default: return status;
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

            {/* BỘ LỌC TRẠNG THÁI */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e5e7eb", paddingBottom: "15px", overflowX: "auto" }}>
              {[
                { id: "all", label: "Tất cả" },
                { id: "pending", label: "Chờ xác nhận" },
                { id: "shipped", label: "Đang giao" },
                { id: "completed", label: "Hoàn tất" },
                { id: "cancelled", label: "Đã hủy" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    background: filterStatus === tab.id ? "#4f46e5" : "#f3f4f6",
                    color: filterStatus === tab.id ? "#fff" : "#4b5563",
                    borderRadius: "20px",
                    fontWeight: filterStatus === tab.id ? "600" : "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ textAlign: "center", padding: "30px" }}>Đang tải lịch sử đơn hàng...</p>
            ) : filteredOrders.length === 0 ? (
              <p style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                {filterStatus === "all" ? "Bạn chưa có đơn hàng nào." : "Không có đơn hàng nào ở trạng thái này."}
              </p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                      <td className="price">{new Intl.NumberFormat('vi-VN').format(order.total_amount)} đ</td>
                      <td>
                        <span className={`status ${order.status}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button className="view-btn" onClick={() => setSelectedOrder(order)} title="Xem chi tiết">
                            <FiEye />
                          </button>
                          
                          {/* CHỈ HIỂN THỊ NÚT HỦY KHI ĐƠN ĐANG "PENDING" */}
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => setConfirmCancelId(order.id)} // ĐỔI TẠI ĐÂY
                              disabled={cancelingId === order.id}
                              style={{ 
                                background: "#fee2e2", color: "#ef4444", border: "none", 
                                width: "32px", height: "32px", borderRadius: "6px", 
                                cursor: cancelingId === order.id ? "not-allowed" : "pointer", 
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s", opacity: cancelingId === order.id ? 0.5 : 1
                              }}
                              title="Hủy đơn hàng"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
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
          MODAL: CHI TIẾT ĐƠN HÀNG
      ========================================== */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", position: "relative", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}><FiX /></button>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Chi tiết đơn hàng #{selectedOrder.id}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", marginBottom: "15px" }}>
              <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")}</p>
              <p><strong>Trạng thái:</strong> <span className={`status ${selectedOrder.status}`}>{getStatusLabel(selectedOrder.status)}</span></p>
              {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
              <p><strong>Tổng thanh toán:</strong> <span style={{ color: "red", fontWeight: "bold" }}>{new Intl.NumberFormat('vi-VN').format(selectedOrder.total_amount)} đ</span></p>
            </div>

            <h4 style={{ fontSize: "15px", marginBottom: "10px", color: "#374151" }}>Sản phẩm đã mua:</h4>
            
            <div style={{ overflowY: "auto", paddingRight: "5px", flex: 1, border: "1px solid #eee", borderRadius: "8px", padding: "10px", background: "#fafafa" }}>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => {
                  const variant = item.product_variant;
                  const product = variant?.product;
                  return (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px 0", borderBottom: index < selectedOrder.items.length - 1 ? "1px dashed #d1d5db" : "none" }}>
                      <img src={product?.thumbnail || "https://placehold.co/60"} alt={product?.name} style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee", background: "#fff" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 5px 0", fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>{product?.name || "Sản phẩm không xác định"}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Phân loại: {variant?.color} - Size {variant?.size}</p>
                        <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#374151" }}>Số lượng: <strong>x{item.quantity}</strong></p>
                      </div>
                      <div style={{ fontWeight: "bold", color: "#ef4444", fontSize: "14px" }}>{new Intl.NumberFormat('vi-VN').format(item.price)} đ</div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: "center", color: "#6b7280", margin: "20px 0" }}>Không có thông tin sản phẩm.</p>
              )}
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ width: "100%", background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}>Đóng</button>
          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU GIỮ NGUYÊN */}
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
      {/* ==========================================
          MODAL: XÁC NHẬN HỦY ĐƠN HÀNG
      ========================================== */}
      {confirmCancelId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "400px", position: "relative", textAlign: "center" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 15px auto" }}>
              <FiTrash2 />
            </div>
            
            <h3 style={{ marginTop: 0, marginBottom: "10px", fontSize: "18px", color: "#111827" }}>Xác nhận hủy đơn hàng</h3>
            <p style={{ color: "#4b5563", fontSize: "14px", marginBottom: "25px" }}>
              Bạn có chắc chắn muốn hủy đơn hàng <strong>#{confirmCancelId}</strong> không? Hành động này không thể hoàn tác.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={() => setConfirmCancelId(null)}
                disabled={cancelingId !== null}
                style={{ flex: 1, padding: "10px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
              >
                Không, quay lại
              </button>
              <button 
                onClick={executeCancelOrder}
                disabled={cancelingId !== null}
                style={{ flex: 1, padding: "10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: cancelingId !== null ? "not-allowed" : "pointer", opacity: cancelingId !== null ? 0.7 : 1 }}
              >
                {cancelingId !== null ? "Đang xử lý..." : "Có, Hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}