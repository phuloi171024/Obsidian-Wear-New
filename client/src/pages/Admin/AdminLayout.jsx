import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiHome,
  FiShoppingCart,
  FiGrid,
  FiUsers,
  FiBarChart2,
  FiMessageCircle,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiPackage,
  FiTag,
  FiLogOut,
  FiBookmark
} from "react-icons/fi";

import "./Admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState({ name: "Admin" });

  // BẢO VỆ TUYẾN ĐƯỜNG (PROTECTED ROUTE)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    let userInfo = {};
    try {
      userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
    } catch (e) {}

    // Kiểm tra nếu chưa đăng nhập hoặc KHÔNG PHẢI ADMIN
    if (!token || userInfo.role !== "admin") {
      toast.error("Bạn cần đăng nhập với quyền Quản trị viên!");
      navigate("/admin/login"); // Đuổi về trang login admin
    } else {
      setAdminInfo(userInfo);
    }
  }, [navigate]);

  // HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) return;
    
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch("http://localhost:8000/api/logout", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error("Lỗi đăng xuất", error);
      }
    }
    
    // Xóa LocalStorage và chuyển hướng
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    toast.success("Đăng xuất thành công!");
    navigate("/admin/login");
  };

  return (
    <div className="admin">
      <Toaster position="top-right" />

      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">
        {/* LOGO */}
        <div className="admin-logo">
          <img src="/src/public/images/logo.png" alt="Obsidian Wear" />
          <div className="admin-logo-text">
            <h2>OBSIDIAN WEAR</h2>
          </div>
        </div>

        {/* MENU */}
        <div className="admin-menu">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active" : "")}>
            <FiHome />
            <span>Bảng điều khiển</span>
          </NavLink>

          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiShoppingCart />
            <span>Quản lí đơn hàng</span>
          </NavLink>

          <div className="admin-menu-dropdown">
            <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "active admin-menu-item" : "admin-menu-item")}>
              <FiPackage />
              <span>Quản lí sản phẩm</span>
            </NavLink>
            <div className="admin-submenu">
              <NavLink to="/admin/products/variants" className={({ isActive }) => (isActive ? "active admin-submenu-item" : "admin-submenu-item")}>
                <span>Biến thể</span>
              </NavLink>
            </div>
          </div>
             <NavLink to="/admin/brands" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiBookmark />
            <span>Quản lí thương hiệu</span>
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiGrid />
            <span>Quản lí danh mục</span>
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiUsers />
            <span>Quản lí thành viên</span>
          </NavLink>

          <NavLink to="/admin/statistics" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiBarChart2 />
            <span>Thống kê</span>
          </NavLink>

          <NavLink to="/admin/comments" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiMessageCircle />
            <span>Quản lí bình luận</span>
          </NavLink>

          <NavLink to="/admin/discount-codes" className={({ isActive }) => (isActive ? "active" : "")}>
            <FiTag />
            <span>Quản lí mã giảm giá</span>
          </NavLink>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search-box">
            <FiSearch />
            <input type="text" placeholder="Tìm kiếm sản phẩm, đơn hàng..." />
          </div>

          <div className="admin-right">
           <div 
              className="admin-bell" 
              onClick={() => toast('Bạn không có thông báo mới nào!', { icon: '🔔', style: { borderRadius: '10px', background: '#333', color: '#fff' } })}
              style={{ cursor: "pointer" }}
              title="Xem thông báo"
            >
              <FiBell />
              
              {/* 
                 Tạm thời anh đã ẩn nó đi bằng cách comment (hoặc em có thể xóa hẳn dòng <span>1</span>).
                 Mẹo nâng cao: Sau này khi có API thông báo, em tạo một state ví dụ: const [unread, setUnread] = useState(0);
                 Rồi dùng logic này để nó tự động hiện khi có thông báo mới:
                 {unread > 0 && <span>{unread}</span>}
              */}
            </div>

            {/* KẾT NỐI SỰ KIỆN ĐĂNG XUẤT VÀO NÚT NÀY */}
            <div 
              className="admin-account" 
              onClick={handleLogout} 
              style={{ cursor: "pointer", padding: "5px", borderRadius: "8px", transition: "0.2s" }}
              title="Nhấn để đăng xuất"
              onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <img src="https://i.pravatar.cc/150?img=12" alt="Admin" />
              <div>
                <h4>Admin</h4>
                <h4 style={{ color: "#2563eb" }}>{adminInfo.name}</h4>
              </div>
              <FiLogOut style={{ color: "#ef4444", fontSize: "18px", marginLeft: "10px" }} />
            </div>
          </div>
        </header>

        <main className="admin-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}