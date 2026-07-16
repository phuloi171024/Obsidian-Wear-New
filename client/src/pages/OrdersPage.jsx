import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";

import {
  FiUser,
  FiClipboard,
  FiLock,
  FiLogOut,
  FiEye,
} from "react-icons/fi";

export default function OrdersPage() {
  const orders = [
    {
      id: "#ORD29275194",
      date: "12 tháng 8, 2025",
      total: "1.250.000 đ",
      method: "COD",
      status: "Chờ xử lý",
    },
    {
      id: "#ORD29843086",
      date: "15 tháng 8, 2025",
      total: "350.000 đ",
      method: "COD",
      status: "Chờ xử lý",
    },
    {
      id: "#ORD77759458",
      date: "15 tháng 8, 2025",
      total: "350.000 đ",
      method: "COD",
      status: "Chờ xử lý",
    },
    {
      id: "#ORD21751592",
      date: "15 tháng 8, 2025",
      total: "1.920.000 đ",
      method: "COD",
      status: "Chờ xử lý",
    },
  ];

  return (
    <>
      <Header />

      <div className="orders-page">

        <div className="account-layout">

          {/* Sidebar */}
          <div className="account-sidebar">

            <h2>Tài khoản của tôi</h2>

            <div className="user-info">
              <div className="avatar">P</div>

              <div>
                <h4>Phi Nguyễn</h4>
                <span>admin@obsidianwear.vn</span>
              </div>
            </div>

            <ul className="account-menu">

              <li>
                <FiUser />
                Thông tin cá nhân
              </li>

              <li className="active">
                <FiClipboard />
                Đơn hàng của tôi
              </li>

              <li>
                <FiLock />
                Đổi mật khẩu
              </li>

              <li className="logout">
                <FiLogOut />
                Đăng xuất
              </li>

            </ul>

          </div>

          {/* Content */}
          <div className="orders-content">

            <div className="orders-header">
              <h2 className="orders-title">
  <FiClipboard />
  Đơn hàng của tôi
</h2>

              <a href="#">Làm mới</a>
            </div>

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td className="order-id">{order.id}</td>
                    <td>{order.date}</td>
                    <td className="price">{order.total}</td>
                    <td>{order.method}</td>

                    <td>
                      <span className="status">
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <button className="view-btn">
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
