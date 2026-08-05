import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập dựa trên token trong localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setShowUserMenu(false);
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src="/src/public/images/logo.png" alt="Logo" />
      </Link>

      <nav className="navbar">
        <ul className="nav-menu">
          <li>
            <Link to="/">Trang chủ</Link>
          </li>
          <li>
            <Link to="/products">Sản phẩm</Link>
          </li>
          <li>
            <Link to="/products/pants">Quần</Link>
          </li>
          <li>
            <Link to="/products/ao">Áo</Link>
          </li>
          <li>
            <Link to="/products/phu-kien">Túi</Link>
          </li>
          <li>
            <Link to="/products/giay">Giày</Link>
          </li>
        </ul>
      </nav>

      <div className="header-right">
        <div className="search-box">
          <input type="text" placeholder="Bạn đang tìm kiếm gì?" />
          <FiSearch className="search-icon" />
        </div>

        {/* User Menu Dropdown */}
        <div className="user-menu-wrapper">
          <button
            className="icon-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <FiUser />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              {isLoggedIn ? (
                // 🟢 HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP (Khớp với các file ProfilePage và OrdersPage của em)
                <>
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                    Trang cá nhân
                  </Link>
                  <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                    Lịch sử đơn hàng
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d4f",
                      padding: "8px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <FiLogOut /> Đăng xuất
                  </button>
                </>
              ) : (
                // 🔴 HIỂN THỊ KHI CHƯA ĐĂNG NHẬP
                <>
                  <Link to="/login" onClick={() => setShowUserMenu(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setShowUserMenu(false)}>
                    Đăng ký
                  </Link>
                  <Link to="/forgot-password" onClick={() => setShowUserMenu(false)}>
                    Quên mật khẩu
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="icon-btn">
          <FiShoppingCart />
        </Link>
      </div>
    </header>
  );
}