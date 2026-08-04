import "./Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  // Trạng thái ẩn/hiện mật khẩu và loading
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Trạng thái lưu trữ dữ liệu form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/api/auth/google";
  };

  // Hàm gọi API Đăng ký tài khoản
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    if (!agreePolicy) {
      toast.error("Bạn phải đồng ý với Điều khoản và Chính sách!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.status === true) {
        // Lưu token và điều hướng
        localStorage.setItem("access_token", data.access_token);
        toast.success("Đăng ký thành công!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        // Hiển thị lỗi do Backend gửi về (ví dụ: Trùng email)
        if (data.errors) {
          const firstError = Object.values(data.errors)[0][0];
          toast.error(firstError);
        } else {
          toast.error(data.message || "Đăng ký thất bại!");
        }
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="auth-box">
        <Link to="/">
          <img src="/src/public/images/logo.png" alt="Logo" className="auth-logo" />
        </Link>

        <h2>Đăng ký tài khoản</h2>

        <div className="form-group">
          <label>Họ và tên <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input 
              type="text" 
              placeholder="Nguyễn Văn A" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>E-mail <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input 
              type="email" 
              placeholder="email@cuaban.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <FiEyeOff className="eye-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <FiEye className="eye-icon" onClick={() => setShowPassword(true)} />
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {showConfirmPassword ? (
              <FiEyeOff className="eye-icon" onClick={() => setShowConfirmPassword(false)} />
            ) : (
              <FiEye className="eye-icon" onClick={() => setShowConfirmPassword(true)} />
            )}
          </div>
        </div>

        <label className="checkbox">
          <input 
            type="checkbox" 
            checked={agreePolicy}
            onChange={(e) => setAgreePolicy(e.target.checked)}
          />
          <span>
            Tôi đồng ý với <a href="#" className="policy-link">Điều khoản</a> và <a href="#" className="policy-link">Chính sách bảo mật</a> của Obsidian Wear
          </span>
        </label>

        <button 
          className="auth-submit" 
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>

        <div className="auth-divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
          <FcGoogle style={{ fontSize: "20px", marginRight: "10px" }} />
          Đăng ký bằng Google
        </button>

        <div className="auth-footer">
          Đã có tài khoản?
          <Link to="/login"> Đăng nhập</Link>
        </div>

      </div>
    </div>
  );
}