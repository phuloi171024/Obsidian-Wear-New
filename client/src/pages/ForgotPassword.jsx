import { useState } from "react";
import "./Auth.css"; 
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { authService } from "../services/authService"; 
import Header from "../components/Header";

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

  const data = err.response?.data;
  const httpStatus = err.response?.status;

  if (httpStatus === 429) {
    setError("Em đã gửi yêu cầu quá nhiều lần. Vui lòng đợi 10 phút!");
  } else if (data?.errors?.email?.[0]) {
    setError(data.errors.email[0]);
  } else if (data?.message) {
    setError(data.message);
  } else if (!err.response) {
    setError("Không kết nối được backend. Hãy kiểm tra Laravel đang chạy!");
  } else {
    setError("Máy chủ không thể gửi email. Vui lòng thử lại!");
  }

  console.error("Forgot password error:", {
    status: httpStatus,
    data,
    error: err,
  });
}
  };

  const alertStyle = {
    backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", 
    padding: "18px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", textAlign: "center"
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <img src="/images/logo.png" alt="logo" className="auth-logo" />
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
                  <input type="email" autoComplete="email" placeholder="email@cuaban.com" value={email} onChange={handleChange} />
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