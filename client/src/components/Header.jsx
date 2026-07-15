import "./Header.css";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";

export default function Header() {
  return (
    <header className="header">
      {/* Phần Logo */}
      <div className="logo">
        <img src="/images/logo.png" alt="Logo Obsidian Wear" />
      </div>

      {/* Phần Menu điều hướng */}
      <nav className="navbar">
        <ul className="nav-menu">
          <li>
            <Link to="/">Trang chủ</Link>
          </li>
          <li>
            <Link to="/products">Sản phẩm</Link>
          </li>
          <li>
            <Link to="/quan">Quần</Link>
          </li>
          <li>
            <Link to="/ao">Áo</Link>
          </li>
          <li>
            <Link to="/tui">Túi</Link>
          </li>
          <li>
            <Link to="/giay">Giày</Link>
          </li>
        </ul>
      </nav>

      {/* Phần bên phải: Tìm kiếm, Tài khoản, Giỏ hàng */}
      <div className="header-right">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Bạn đang tìm kiếm gì?" 
          />
          <FiSearch className="search-icon" />
        </div>

       <Link to="/login" className="icon-btn" title="Tài khoản">
  <FiUser />
</Link>

        <Link to="/cart" className="icon-btn" title="Giỏ hàng">
          <FiShoppingCart />
        </Link>
      </div>
    </header>
  );
}