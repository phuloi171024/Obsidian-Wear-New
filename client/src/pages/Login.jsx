import "./Auth.css";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye
} from "react-icons/fi";

export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-box">

        <img
          src="/src/public/images/logo.png"
          alt="logo"
          className="auth-logo"
        />

        <h2>Đăng nhập</h2>

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

        <div className="auth-row">
          <label className="checkbox">
            <input type="checkbox" />
            Ghi nhớ đăng nhập
          </label>

          <Link to="/forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <button className="auth-submit">
          Đăng nhập
        </button>

        <div className="auth-footer">
          Bạn chưa có tài khoản?
          <Link to="/register"> Đăng ký ngay</Link>
        </div>

      </div>
    </div>
  );
}
