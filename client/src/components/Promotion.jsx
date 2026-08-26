import "./Newsletter.css";
import { FiArrowRight } from "react-icons/fi";

export default function Promotion() {
  return (
    <section className="newsletter">
      <div className="newsletter-container">

        <div className="newsletter-content">
          <span className="newsletter-label">
            OBSIDIAN WEAR
          </span>

          <h2>
            NHẬN ƯU ĐÃI MỚI NHẤT
          </h2>

          <p>
            Đăng ký để nhận thông tin về sản phẩm mới,
            bộ sưu tập mới và những chương trình ưu đãi đặc biệt.
          </p>
        </div>

        <div className="newsletter-form">
          <div className="newsletter-input-wrapper">
            <input
              type="email"
              placeholder="Email của bạn"
            />
          </div>

          <button type="button">
            <span>ĐĂNG KÝ</span>
            <FiArrowRight />
          </button>
        </div>

      </div>
    </section>
  );
}