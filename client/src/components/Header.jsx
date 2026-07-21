import "./Header.css";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
import { useState } from "react";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header">

      <div className="logo">
        <img src="/src/public/images/logo.png" alt="Logo" />
      </div>

      <nav className="navbar">
        <ul className="nav-menu">

          <li>
            <Link to="/">Trang chủ</Link>
          </li>

          <li>
            <Link to="/products">Sản phẩm</Link>
          </li>

          <li>
  <Link to="/products">Quần</Link>
</li>

<li>
  <Link to="/products">Áo</Link>
</li>

<li>
  <Link to="/products">Túi</Link>
</li>

<li>
  <Link to="/products">Giày</Link>
</li>

        </ul>
      </nav>

      <div className="header-right">

        <div className="search-box">
          <input
            type="text"
            placeholder="Bạn đang tìm kiếm gì?"
          />
          <FiSearch className="search-icon" />
        </div>

        {/* User Menu */}
        <div className="user-menu-wrapper">
          <button
            className="icon-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <FiUser />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
              <Link to="/forgot-password">Quên mật khẩu</Link>
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
