import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBox, FiUsers, FiDollarSign, FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Admin.css"; 

export default function Dashboard() {
  const navigate = useNavigate(); // KHỞI TẠO HÀM CHUYỂN TRANG
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    revenue: 0,
    orders: 0
  });
  
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // GỌI API LẤY DỮ LIỆU THẬT
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const headers = {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const [dashRes, ordersRes, usersRes] = await Promise.all([
          fetch("http://localhost:8000/api/admin/dashboard", { headers }),
          fetch("http://localhost:8000/api/admin/orders?per_page=5", { headers }),
          fetch("http://localhost:8000/api/admin/users?per_page=5", { headers })
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setStats({
            products: dashData.products?.total || 0,
            users: dashData.users?.total || 0,
            revenue: dashData.revenue?.current || 0,
            orders: dashData.orders?.total || 0
          });
          setTopProducts(dashData.top_products || []);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.data || []);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setNewCustomers(usersData.data || []);
        }

      } catch (error) {
        console.error("Lỗi fetch dashboard:", error);
        toast.error("Không thể tải dữ liệu bảng điều khiển!");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const translateStatus = (status) => {
    switch (status) {
      case "pending": return { text: "Chờ xác nhận", class: "status pending" };
      case "processing": return { text: "Đang xử lý", class: "status pending" };
      case "shipped": return { text: "Đang giao", class: "status shipping" };
      case "completed": return { text: "Đã giao", class: "status done" }; // Cập nhật chữ completed
      case "cancelled": return { text: "Hủy đơn", class: "status cancel" };
      default: return { text: status, class: "status pending" };
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  if (loading) {
    return <div style={{ padding: "50px", textAlign: "center", fontSize: "16px", color: "#666" }}>Đang tải dữ liệu Bảng điều khiển...</div>;
  }

  return (
    <>
      <h1 className="page-title">Bảng điều khiển</h1>

      {/* 4 THẺ THỐNG KÊ (ĐÃ GẮN SỰ KIỆN CLICK CHUYỂN TRANG) */}
      <div className="dashboard-cards">
        
        {/* Hộp Sản phẩm */}
        <div 
          className="dashboard-card" 
          onClick={() => navigate('/admin/products')} 
          style={{ cursor: "pointer", transition: "0.2s" }}
        >
          <div className="dashboard-icon blue">
            <FiBox />
          </div>
          <div>
            <h3>{stats.products}</h3>
            <p>Tổng sản phẩm</p>
          </div>
        </div>

        {/* Hộp Thành viên */}
        <div 
          className="dashboard-card" 
          onClick={() => navigate('/admin/users')} 
          style={{ cursor: "pointer", transition: "0.2s" }}
        >
          <div className="dashboard-icon green">
            <FiUsers />
          </div>
          <div>
            <h3>{stats.users}</h3>
            <p>Tổng thành viên</p>
          </div>
        </div>

        {/* Hộp Doanh thu */}
        <div 
          className="dashboard-card" 
          onClick={() => navigate('/admin/statistics')} 
          style={{ cursor: "pointer", transition: "0.2s" }}
        >
          <div className="dashboard-icon orange">
            <FiDollarSign />
          </div>
          <div>
            <h3 style={{ fontSize: stats.revenue > 999999999 ? '22px' : '28px' }}>
              {formatVND(stats.revenue)}
            </h3>
            <p>Doanh thu tháng này</p>
          </div>
        </div>

        {/* Hộp Đơn hàng */}
        <div 
          className="dashboard-card" 
          onClick={() => navigate('/admin/orders')} 
          style={{ cursor: "pointer", transition: "0.2s" }}
        >
          <div className="dashboard-icon purple">
            <FiShoppingCart />
          </div>
          <div>
            <h3>{stats.orders}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
        
        <div className="card">
          <div className="card-title">
            <h3>Top sản phẩm bán chạy</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style={{ textAlign: "right" }}>Đã bán</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img 
                        src={prod.thumbnail || "https://placehold.co/40"} 
                        alt={prod.name} 
                        style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", border: "1px solid #eee" }} 
                      />
                      <span style={{ fontWeight: "500", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                        {prod.name}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", color: "#16a34a", fontWeight: "600" }}>
                      {prod.total_sold}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", color: "#888" }}>Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">
            <h3>Đơn hàng mới nhất</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th style={{ textAlign: "right" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const statusInfo = translateStatus(order.status);
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: "600", color: "#111827" }}>#{order.id}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className={statusInfo.class}>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", color: "#888" }}>Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">
            <h3>Khách hàng mới</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th style={{ textAlign: "right" }}>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {newCustomers.length > 0 ? (
                newCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: "500", color: "#444" }}>
                      {customer.name}
                    </td>
                    <td style={{ textAlign: "right", color: "#888", fontSize: "13px" }}>
                      {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", color: "#888" }}>Chưa có khách hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}