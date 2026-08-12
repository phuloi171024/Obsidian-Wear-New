import React from "react";
import { FiBox, FiUsers, FiTag, FiShoppingCart } from "react-icons/fi";
import "./Admin.css"; // Đảm bảo import đúng file CSS sáng màu của bạn

// ---- Mock data — (Thay bằng API thật sau này) ----
const revenueOrders = [
  { id: "OW15201", amount: "630.000 VND" },
  { id: "OW15202", amount: "499.000 VND" },
  { id: "OW15203", amount: "303.000 VND" },
  { id: "OW15204", amount: "735.000 VND" },
  { id: "OW15205", amount: "393.000 VND" },
];

const allOrders = [
  { id: "OW15201", status: "Đang giao", total: "630.000 VND" },
  { id: "OW15202", status: "Hủy đơn", total: "499.000 VND" },
  { id: "OW15203", status: "Chờ xác nhận", total: "303.000 VND" },
  { id: "OW15204", status: "Hủy đơn", total: "735.000 VND" },
  { id: "OW15205", status: "Đã giao", total: "393.000 VND" },
];

const newCustomers = [
  { id: "20110", username: "Tuan Nguyen", email: "tuan@example.com" },
  { id: "20022", username: "Shormaynn", email: "shormaynn@example.com" },
  { id: "20003", username: "Jamin", email: "jamin@example.com" },
  { id: "20004", username: "Thanh Dat", email: "datthanh@example.com" },
  { id: "20005", username: "Phu Loi", email: "loiphu@example.com" },
];

export default function Dashboard() {
  
  // Hàm chuyển đổi trạng thái thành class CSS tương ứng trong Admin.css
  const getStatusClass = (status) => {
    switch (status) {
      case "Đang giao":
        return "status shipping";
      case "Đã giao":
        return "status done";
      case "Hủy đơn":
        return "status cancel";
      case "Chờ xác nhận":
        return "status pending";
      default:
        return "status pending";
    }
  };

  return (
    <>
      {/* TIÊU ĐỀ TRANG */}
      <h1 className="page-title">Bảng điều khiển</h1>

      {/* 4 THẺ THỐNG KÊ (Dùng các class màu của Admin.css) */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="dashboard-icon blue">
            <FiBox />
          </div>
          <div>
            <h3>1,250</h3>
            <p>Tổng sản phẩm</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon green">
            <FiUsers />
          </div>
          <div>
            <h3>5,340</h3>
            <p>Tổng thành viên</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon orange">
            <FiTag />
          </div>
          <div>
            <h3>15</h3>
            <p>Tổng danh mục</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon purple">
            <FiShoppingCart />
          </div>
          <div>
            <h3>890</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
      </div>

      {/* KHU VỰC BẢNG DỮ LIỆU */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
        
        {/* BẢNG 1: TỔNG DOANH THU */}
        <div className="card">
          <div className="card-title">
            <h3>Tổng doanh thu</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th style={{ textAlign: "right" }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {revenueOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td style={{ textAlign: "right", color: "#16a34a", fontWeight: "600" }}>
                    {order.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BẢNG 2: ĐƠN HÀNG MỚI */}
        <div className="card">
          <div className="card-title">
            <h3>Đơn hàng mới</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th style={{ textAlign: "right" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className={getStatusClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BẢNG 3: KHÁCH HÀNG MỚI */}
        <div className="card">
          <div className="card-title">
            <h3>Khách hàng mới</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th style={{ textAlign: "right" }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {newCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: "500", color: "#444" }}>
                    {customer.username}
                  </td>
                  <td style={{ textAlign: "right", color: "#888", fontSize: "13px" }}>
                    {customer.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}