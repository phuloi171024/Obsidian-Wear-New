import "./Auth.css";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye
} from "react-icons/fi";

export default function Register() {
  return (
    <div className="auth-page">
      <div className="auth-box">

        <img
          src="/src/public/images/logo.png"
          alt="Logo"
          className="auth-logo"
        />

        <h2>Đăng ký tài khoản</h2>

        <div className="form-group">
  <label>Họ và tên</label>

  <div className="input-wrapper">
    <FiUser className="input-icon" />
    <input
      type="text"
      placeholder="Nguyễn Văn A"
    />
  </div>
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

        <div className="form-group">
  <label>Số điện thoại (tùy chọn)</label>

  <div className="input-wrapper">
    <FiPhone className="input-icon" />
    <input
      type="tel"
      placeholder="0123456789"
    />
  </div>
</div>

        <div className="form-group">
  <label>Mật khẩu</label>

  <div className="input-wrapper">
    <FiLock className="input-icon" />

    <input
      type="password"
      placeholder="••••••••"
    />

    <FiEye className="eye-icon" />
  </div>
</div>

        <div className="form-group">
  <label>Xác nhận mật khẩu</label>

  <div className="input-wrapper">
    <FiLock className="input-icon" />

    <input
      type="password"
      placeholder="••••••••"
    />

    <FiEye className="eye-icon" />
  </div>
</div>

        <label className="checkbox">
  <input type="checkbox" />

  <span>
    Tôi đồng ý với{" "}
    <a href="#" className="policy-link">
      Điều khoản
    </a>{" "}
    và{" "}
    <a href="#" className="policy-link">
      Chính sách bảo mật
    </a>{" "}
    của Obsidian Wear
  </span>
</label>

        <button className="auth-submit">
          Đăng ký
        </button>

        <div className="auth-footer">
          Đã có tài khoản?
          <Link to="/login"> Đăng nhập</Link>
        </div>

      </div>
    </div>
  );
}
