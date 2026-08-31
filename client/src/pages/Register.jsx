import { API_BASE_URL } from "../config/api";
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

  // THÊM STATE NÀY ĐỂ LƯU LỖI TỪ API TRẢ VỀ
  const [apiErrors, setApiErrors] = useState({});

const handleGoogleLogin = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/google`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.status === true && data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Không thể mở trang đăng ký Google!");
    }
  } catch (error) {
    toast.error("Không thể kết nối đến máy chủ!");
  }
};

  // Hàm gọi API Đăng ký tài khoản
  const handleRegister = async () => {
    if (isLoading) return;

    // Reset mảng lỗi mỗi lần bấm nút đăng ký
    setApiErrors({});

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
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
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone || null,
          password: password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (
        response.ok &&
        data.status === true &&
        data.access_token &&
        data.data
      ) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data.data));
        window.dispatchEvent(new Event("loginSuccess"));
        toast.success(data.message || "Đăng ký thành công!");
        navigate("/", { replace: true });
      } else {
        // Hiển thị lỗi do Backend gửi về
        if (data.errors) {
          // Lưu toàn bộ lỗi vào State để hiển thị xuống dưới ô input
          setApiErrors(data.errors);
          const firstError = Object.values(data.errors).flat().find(Boolean);
          toast.error(firstError || "Thông tin đăng ký không hợp lệ!");
        } else {
          toast.error(data.message || "Đăng ký thất bại!");
        }
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
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
          <img src="/images/logo.png" alt="Logo" className="auth-logo" />
        </Link>

        <h2>Đăng ký tài khoản</h2>

        <div className="form-group">
          <label>Họ và tên <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input 
              type="text" 
              name="name"
              autoComplete="name"
              placeholder="Nguyễn Văn A" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Xóa lỗi khi người dùng bắt đầu gõ lại
                if (apiErrors.name) setApiErrors({ ...apiErrors, name: null });
              }}
            />
          </div>
          {/* Hiển thị lỗi Họ Tên */}
          {apiErrors.name && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", marginBottom: "0", textAlign: "left" }}>{apiErrors.name[0]}</p>}
        </div>

        <div className="form-group">
          <label>E-mail <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input 
              type="email" 
              name="email"
              autoComplete="email"
              placeholder="email@cuaban.com" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Xóa lỗi khi người dùng bắt đầu gõ lại
                if (apiErrors.email) setApiErrors({ ...apiErrors, email: null });
              }}
            />
          </div>
          {/* Hiển thị lỗi Email (Ví dụ: Email đã tồn tại) */}
          {apiErrors.email && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", marginBottom: "0", textAlign: "left" }}>{apiErrors.email[0]}</p>}
        </div>

        <div className="form-group">
          <label>Số điện thoại (tùy chọn)</label>
          <div className="input-wrapper">
            <FiPhone className="input-icon" />
            <input 
              type="tel" 
              name="phone"
              autoComplete="tel"
              placeholder="0123456789" 
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (apiErrors.phone) setApiErrors({ ...apiErrors, phone: null });
              }}
            />
          </div>
          {/* Hiển thị lỗi SĐT */}
          {apiErrors.phone && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", marginBottom: "0", textAlign: "left" }}>{apiErrors.phone[0]}</p>}
        </div>

        <div className="form-group">
          <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (apiErrors.password) setApiErrors({ ...apiErrors, password: null });
              }}
            />
            {showPassword ? (
              <FiEyeOff className="eye-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <FiEye className="eye-icon" onClick={() => setShowPassword(true)} />
            )}
          </div>
          {/* Hiển thị lỗi Mật khẩu */}
          {apiErrors.password && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", marginBottom: "0", textAlign: "left" }}>{apiErrors.password[0]}</p>}
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu <span style={{color: 'red'}}>*</span></label>
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="password_confirmation"
              autoComplete="new-password"
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
          type="button"
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
