import "./Header.css";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
import { Link } from 'react-router-dom';

export default function Header(){

    return(

        <header className="header">

            <div className="logo">
                <img src="src/public/images/logo.png" alt="Logo" />
            </div>

            <nav className="navbar">
  <ul className="nav-menu">
    <li><a href="/">Trang chủ</a></li>
    <li><a href="/quan">Quần</a></li>
    <li><a href="/ao">Áo</a></li>
    <li><a href="/tui">Túi</a></li>
    <li><a href="/giay">Giày</a></li>
  </ul>
</nav>

            <div className="search-box">
    <input
        type="text"
        placeholder="Bạn đang tìm kiếm gì?"
    />
    <FiSearch className="search-icon" />
</div>

<Link to="/login"> <button className="icon-btn">
    <FiUser />
</button> </Link>

<button className="icon-btn">
    <FiShoppingCart />
</button>

        </header>

    );

}