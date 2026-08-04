import "./Auth.css";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc"; // Thêm icon Google từ react-icons

export default function Login() {
  // Hàm xử lý khi bấm nút Đăng nhập Google
  const handleGoogleLogin = () => {
    // Trỏ thẳng về API Route xử lý Google Socialite ở Backend Laravel của em
    window.location.href = "http://127.0.0.1:8000/api/auth/google";
  };

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

        {/* --- PHẦN ĐĂNG NHẬP BẰNG GOOGLE --- */}
        <div className="auth-divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <button 
          type="button" 
          className="google-login-btn"
          onClick={handleGoogleLogin}
        >
          <FcGoogle style={{ fontSize: "20px", marginRight: "10px" }} />
          Đăng nhập bằng Google
        </button>
        {/* ---------------------------------- */}

        <div className="auth-footer">
          Bạn chưa có tài khoản?
          <Link to="/register"> Đăng ký ngay</Link>
        </div>

      </div>
    </div>
  );
}