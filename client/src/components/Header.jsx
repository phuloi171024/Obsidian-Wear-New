import "./Header.css";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";

export default function Header() {
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
          <input type="text" placeholder="Bạn đang tìm kiếm gì?" />
          <FiSearch className="search-icon" />
        </div>

        <Link to="/register" className="icon-btn">
          <FiUser />
        </Link>

        <Link to="/cart" className="icon-btn">
          <FiShoppingCart />
        </Link>
      </div>
    </header>
  );
}