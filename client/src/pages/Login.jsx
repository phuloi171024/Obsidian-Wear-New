import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && (data.access_token || data.token)) {
        const token = data.access_token || data.token;
        
        // Lưu token để bảo vệ trang cá nhân
        localStorage.setItem("access_token", token);
        
        if (data.data) {
          localStorage.setItem("user_info", JSON.stringify(data.data));
        }

        toast.success(data.message || "Đăng nhập thành công!");
        
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error(data.message || "Email hoặc mật khẩu không chính xác!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chuyển hướng đến Google Login của Laravel
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="auth-page">
        <div className="auth-box">
          {/* Logo trang web */}
          <img 
            src="/src/public/images/logo.png" 
            alt="Logo" 
            className="auth-logo"
            onError={(e) => { e.target.style.display = 'none'; }} 
          />

          <h2>Đăng nhập tài khoản</h2>

          <form onSubmit={handleLogin}>
            {/* Ô Email */}
            <div className="form-group">
              <label>Email *</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com"
                  required 
                />
              </div>
            </div>

            {/* Ô Mật khẩu kèm icon ẩn/hiện */}
            <div className="form-group">
              <label>Mật khẩu *</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu của bạn"
                  required 
                />
                <span 
                  className="eye-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* Hàng chức năng (Ghi nhớ & Quên mật khẩu) */}
            <div className="auth-row">
              <label className="checkbox" style={{ margin: 0 }}>
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            {/* Nút Submit */}
            <button type="submit" disabled={isLoading} className="auth-submit">
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* Đường phân cách */}
          <div className="auth-divider">
            <span>Hoặc đăng nhập với</span>
          </div>

          {/* Nút đăng nhập Google */}
          <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
            Tiếp tục với Google
          </button>

          {/* Chân trang chuyển sang đăng ký */}
          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </>
  );
}