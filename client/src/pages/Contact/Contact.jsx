import "./Contact.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
} from "react-icons/fi";

export default function Contact() {
  return (
    <>
      <Header />
      <div className="breadcrumb">
  <Link to="/">Trang chủ</Link>

  <span className="separator">&gt;</span>

  <span className="current-page">Liên hệ</span>
</div>

      <div className="contact-page">

        <div className="contact-container">

          <div className="contact-title">
            <h1>Liên hệ với chúng tôi</h1>

            <p>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
              Nếu có bất kỳ câu hỏi hoặc góp ý nào,
              vui lòng liên hệ với Obsidian Wear.
            </p>
          </div>

          <div className="contact-content">

            {/* LEFT */}

            <div className="contact-left">

              <div className="contact-card">

                <h3>Thông tin liên hệ</h3>

                <div className="info-item">
                  <FiMapPin />

                  <div>
                    <b>Địa chỉ</b>

                    <p>
                      123 Nguyễn Văn Linh,
                      Quận 7,
                      TP Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <FiPhone />

                  <div>
                    <b>Điện thoại</b>

                    <p>+84 (0) 123 456 789</p>
                  </div>
                </div>

                <div className="info-item">
                  <FiMail />

                  <div>
                    <b>Email</b>

                    <p>hello@obsidianwear.vn</p>
                  </div>
                </div>

                <div className="info-item">
                  <FiClock />

                  <div>
                    <b>Giờ làm việc</b>

                    <p>Thứ Hai - Thứ Bảy: 09:00 - 21:00</p>

                    <p>Chủ Nhật: 10:00 - 18:00</p>
                  </div>
                </div>

              </div>

              <div className="map-box">

                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps?q=123+Nguyen+Van+Linh,+Quan+7,+Ho+Chi+Minh&output=embed"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>

            </div>

            {/* RIGHT */}

            <div className="contact-right">

              <div className="contact-form">

                <h3>Gửi tin nhắn cho chúng tôi</h3>

                <div className="row">

                  <div className="form-group">

                    <label>Họ và tên *</label>

                    <input
                      type="text"
                      placeholder="Nhập họ và tên"
                    />

                  </div>

                  <div className="form-group">

                    <label>Email *</label>

                    <input
                      type="email"
                      placeholder="Nhập địa chỉ email"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>Tiêu đề *</label>

                  <input
                    type="text"
                    placeholder="Nhập tiêu đề"
                  />

                </div>

                <div className="contact-form-group">
  <label>Nội dung *</label>

  <textarea
    rows="8"
    placeholder="Nhập nội dung tin nhắn..."
  ></textarea>
</div>

                <div className="btn-right">

                  <button>
                    Gửi tin nhắn
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
