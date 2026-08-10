import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  // STATE MỚI: Quản lý từ khóa tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token); // Chuyển thành true nếu có token, false nếu không
    };

    // 1. Kiểm tra ngay khi web vừa mở
    checkLoginStatus();

    // 2. Lắng nghe tín hiệu "loginSuccess" từ trang Login
    window.addEventListener("loginSuccess", checkLoginStatus);

    // Dọn dẹp sự kiện khi Header bị hủy
    return () => {
      window.removeEventListener("loginSuccess", checkLoginStatus);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setShowUserMenu(false);
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  // HÀM MỚI: Xử lý khi nhấn tìm kiếm
  const handleSearch = (e) => {
    // Nếu người dùng nhấn Enter hoặc click chuột vào icon
    if (e.key === "Enter" || e.type === "click") {
      if (searchKeyword.trim() !== "") {
        // Chuyển hướng sang trang sản phẩm kèm từ khóa trên thanh URL
        navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
        setSearchKeyword(""); // Xóa ô input sau khi tìm kiếm xong
      }
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src="/src/public/images/logo.png" alt="Logo" />
      </Link>

      <nav className="navbar">
        <ul className="nav-menu">
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/products/pants">Quần</Link></li>
          <li><Link to="/products/ao">Áo</Link></li>
          <li><Link to="/products/phu-kien">Túi</Link></li>
          <li><Link to="/products/giay">Giày</Link></li>
        </ul>
      </nav>

      <div className="header-right">
        {/* ĐÃ THÊM LOGIC VÀO KHUNG TÌM KIẾM CŨ (Không đổi CSS) */}
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Bạn đang tìm kiếm gì?" 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearch}
          />
          <FiSearch 
            className="search-icon" 
            onClick={handleSearch} 
            style={{ cursor: "pointer" }} 
          />
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
                <>
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>Trang cá nhân</Link>
                  <Link to="/orders" onClick={() => setShowUserMenu(false)}>Lịch sử đơn hàng</Link>
                  <button 
                    onClick={handleLogout} 
                    style={{
                      background: "none", border: "none", color: "#ff4d4f",
                      padding: "8px 12px", textAlign: "left", cursor: "pointer",
                      width: "100%", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px"
                    }}
                  >
                    <FiLogOut /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setShowUserMenu(false)}>Đăng nhập</Link>
                  <Link to="/register" onClick={() => setShowUserMenu(false)}>Đăng ký</Link>
                
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