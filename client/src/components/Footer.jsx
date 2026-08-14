import "./Footer.css";
import { Link } from "react-router-dom";

import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import {
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Cột 1 */}
        <div className="footer-col">
          <h3>Về Obsidian Wear</h3>

          <p className="about">
            Obsidian Wear cung cấp các sản phẩm quần áo thể thao chất lượng
            cao với nhiều phong cách đa dạng cho nam, nữ và trẻ em.
          </p>

          <div className="social">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
          </div>

          <h4>Phương Thức Thanh Toán</h4>

          <div className="payment">
            <img src="/src/public/images/visa.png" alt="Visa" />
            <img src="/src/public/images/mastercard.png" alt="MasterCard" />
            <img src="/src/public/images/jcb.png" alt="JCB" />
            <img src="/src/public/images/vnpay.png" alt="VNPay" />
            <img src="/src/public/images/momo.png" alt="MoMo" />
          </div>
        </div>

        {/* Cột 2: Đã gắn Link chuyển trang */}
        <div className="footer-col">
          <h3>Danh Mục</h3>

          <ul>
            <li>
              <Link to="/products/ao" className="footer-link">Áo thể thao</Link>
            </li>
            <li>
              <Link to="/products/pants" className="footer-link">Quần thể thao</Link>
            </li>
            <li>
              <Link to="/products/giay" className="footer-link">Giày thể thao</Link>
            </li>
            <li>
              <Link to="/products/phu-kien" className="footer-link">Túi & Phụ kiện</Link>
            </li>
            <li>
              <Link to="/products" className="footer-link">Tất cả sản phẩm</Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Đã gắn Link chuyển trang */}
        <div className="footer-col">
          <h3>Hỗ Trợ</h3>

          <ul>
            <li>
              <Link to="/size-guide" className="footer-link">Hướng dẫn chọn size</Link>
            </li>
            <li>
              <Link to="/contact" className="footer-link">Liên hệ với chúng tôi</Link>
            </li>
            <li>
              {/* Nếu sau này em làm trang Chính sách, hãy sửa to="/" thành to="/chinh-sach" nhé */}
              <Link to="/" className="footer-link">Câu hỏi thường gặp</Link>
            </li>
            <li>
              <Link to="/" className="footer-link">Chính sách vận chuyển</Link>
            </li>
            <li>
              <Link to="/" className="footer-link">Chính sách đổi trả</Link>
            </li>
          </ul>
        </div>

        {/* Cột 4 */}
        <div className="footer-col">
          <h3>Liên Hệ</h3>

          <p>
            <FiMapPin />
            123 Nguyễn Văn Linh, Quận 7, TP.HCM
          </p>

          <p>
            <FiPhone />
            +84 123 456 789
          </p>

          <p>
            <FiMail />
            hello@obsidianwear.vn
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="copyright">
          © 2026 OBSIDIAN WEAR. All rights reserved.
        </div>
      </div>
    </footer>
  );
}