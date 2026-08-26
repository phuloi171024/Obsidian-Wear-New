import "./Footer.css";
import { Link } from "react-router-dom";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="ash-footer">

      <div className="ash-footer-main">

        {/* CỘT THÔNG TIN */}
        <div className="ash-footer-column ash-footer-company">

          <h3>THÔNG TIN CỬA HÀNG</h3>

          <h4>OBSIDIAN WEAR</h4>

          <p>
            Thời trang thể thao chính hãng với phong cách
            hiện đại, năng động và tối giản.
          </p>

          <p>
            <strong>Địa chỉ:</strong>
            <br />
            123 Nguyễn Văn Linh, Quận 7, TP.HCM
          </p>

          <p>
            <strong>Email:</strong>{" "}
            hello@obsidianwear.vn
          </p>

          <p>
            <strong>Hotline:</strong>{" "}
            +84 123 456 789
          </p>

        </div>


        {/* CHÍNH SÁCH */}
        <div className="ash-footer-column">

          <h3>CHÍNH SÁCH</h3>

          <ul>
            <li>
              <Link to="/products">
                Tất cả sản phẩm
              </Link>
            </li>

            <li>
              <Link to="/shipping-info">
                Chính sách vận chuyển
              </Link>
            </li>

            <li>
              <Link to="/">
                Chính sách đổi trả
              </Link>
            </li>

            <li>
              <Link to="/">
                Phương thức thanh toán
              </Link>
            </li>

            <li>
              <Link to="/">
                Chính sách bảo mật
              </Link>
            </li>
          </ul>

        </div>


        {/* HỖ TRỢ */}
        <div className="ash-footer-column">

          <h3>HỖ TRỢ KHÁCH HÀNG</h3>

          <ul>
            <li>
              <Link to="/size-guide">
                Hướng dẫn chọn size
              </Link>
            </li>

            <li>
              <Link to="/contact">
                Thông tin liên hệ
              </Link>
            </li>

            <li>
              <Link to="/orders">
                Kiểm tra đơn hàng
              </Link>
            </li>

            <li>
              <Link to="/">
                Câu hỏi thường gặp
              </Link>
            </li>

            <li>
              <Link to="/products">
                Hướng dẫn mua hàng
              </Link>
            </li>
          </ul>

        </div>


        {/* DANH MỤC */}
        <div className="ash-footer-column">

          <h3>DANH MỤC SẢN PHẨM</h3>

          <ul>
            <li>
              <Link to="/products/ao">
                Áo
              </Link>
            </li>

            <li>
              <Link to="/products/pants">
                Quần
              </Link>
            </li>

            <li>
              <Link to="/products/phu-kien">
                Túi
              </Link>
            </li>

            <li>
              <Link to="/products/giay">
                Giày
              </Link>
            </li>
          </ul>

        </div>

      </div>


      {/* FOOTER LOWER */}
      <div className="ash-footer-lower">

        <div className="ash-footer-social">

          <span>THEO DÕI OBSIDIAN WEAR</span>

          <div>
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="#" aria-label="Youtube">
              <FaYoutube />
            </a>
          </div>

        </div>


        <div className="ash-footer-payment">

          <span>PHƯƠNG THỨC THANH TOÁN</span>

          <div>
            <img
              src="/images/visa.png"
              alt="Visa"
            />

            <img
              src="/images/mastercard.png"
              alt="MasterCard"
            />

            <img
              src="/images/jcb.png"
              alt="JCB"
            />

            <img
              src="/images/vnpay.png"
              alt="VNPay"
            />

            <img
              src="/images/momo.png"
              alt="MoMo"
            />
          </div>

        </div>

      </div>


      {/* COPYRIGHT */}
      <div className="ash-footer-bottom">

        <span>
          © 2026 OBSIDIAN WEAR. Mọi quyền được bảo lưu.
        </span>

        <span>
          THỜI TRANG THỂ THAO CHÍNH HÃNG
        </span>

      </div>

    </footer>
  );
}
