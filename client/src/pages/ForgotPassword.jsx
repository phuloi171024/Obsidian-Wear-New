import "./Auth.css";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";

export default function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-box">

        <img
          src="/src/public/images/logo.png"
          alt="logo"
          className="auth-logo"
        />

        <h2>Quên mật khẩu</h2>

        <div className="auth-desc">
          Nhập địa chỉ email của bạn và chúng tôi sẽ gửi một
          liên kết đặt lại mật khẩu
        </div>

        <div className="form-group">
          <label>E-mail</label>

          <div className="input-wrapper">
            <FiMail className="input-icon" />

            <input
              type="email"
              placeholder="email@của bạn.com"
            />
          </div>
        </div>

        <button className="auth-submit">
          Gửi liên kết đặt lại mật khẩu
        </button>

        <div className="auth-footer">
          <Link to="/login">
            ← Quay lại đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
