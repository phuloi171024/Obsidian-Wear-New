import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiClipboard, FiLock, FiLogOut, FiEye } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "Khách hàng", email: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Toaster position="top-right" />
      <Header />

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
              <li><FiLock /> Đổi mật khẩu</li>
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
                        <button className="view-btn"><FiEye /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}