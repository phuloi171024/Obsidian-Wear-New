import { useState } from "react";
import "./Auth.css"; 
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { authService } from "../services/authService"; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); 

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Vui lòng nhập email");
    if (!validateEmail(email.trim())) return setError("Email không hợp lệ");

    setStatus("loading");
    try {
        const data = await authService.forgotPassword(email);
        if (data.status) setStatus("sent");
    } catch (err) {
        setStatus("idle");
        if (err.response && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError("Có lỗi xảy ra khi gửi mail. Vui lòng thử lại!");
        }
    }
  };

  const alertStyle = {
    backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", 
    padding: "18px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", textAlign: "center"
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <img src="/src/public/images/logo.png" alt="logo" className="auth-logo" />
        <h2>Quên mật khẩu</h2>

        {status === "sent" ? (
          <div style={alertStyle}>
            <p style={{ margin: "0 0 4px 0" }}>Đã gửi liên kết đặt lại mật khẩu đến:</p>
            <strong style={{ color: "#14532d", wordBreak: "break-all", display: "block", margin: "4px 0" }}>{email}</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.9 }}>Vui lòng kiểm tra hộp thư của bạn.</p>
          </div>
        ) : (
          <>
            <div className="auth-desc">Nhập địa chỉ email của bạn và chúng tôi sẽ gửi một liên kết đặt lại mật khẩu</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>E-mail</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input type="email" placeholder="email@cuaban.com" value={email} onChange={handleChange} />
                </div>
                {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>{error}</p>}
              </div>
              <button type="submit" className="auth-submit" disabled={status === "loading"}>
                {status === "loading" ? "Đang xử lý..." : "Gửi liên kết đặt lại mật khẩu"}
              </button>
            </form>
          </>
        )}
        <div className="auth-footer"><Link to="/login">← Quay lại đăng nhập</Link></div>
      </div>
    </div>
  );
}