import "./Header.css";
import { Link } from "react-router-dom";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";

export default function Header() {
  return (
    <header className="header">

      <div className="logo">
        <img src="/images/logo.png" alt="Logo Obsidian Wear" />
      </div>
      <div className="logo">
        <img src="/images/logo.png" alt="Logo Obsidian Wear" />
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

      <div className="header-right">
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

      <div className="header-right">

        <div className="search-box">
          <input
            type="text"
            placeholder="Bạn đang tìm kiếm gì?"
          />
          <FiSearch className="search-icon" />
        </div>

        <button className="icon-btn" title="Tài khoản">
          <FiUser />
        </button>

        {/* Đã sửa: Chỉ dùng 1 thẻ Link duy nhất và áp class trực tiếp vào nó */}
        <Link to="/cart" className="icon-btn" title="Giỏ hàng">
          <FiShoppingCart />
        </Link>

      </div>

    </header>
  );
    </header>
  );
}