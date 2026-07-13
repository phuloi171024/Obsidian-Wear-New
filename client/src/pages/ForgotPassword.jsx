import { useState } from "react";
import "./Auth.css";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "sent"

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }

    setStatus("loading");
    // Giả lập gọi API gửi email đặt lại mật khẩu
    setTimeout(() => {
      setStatus("sent");
    }, 1000);
  };

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

        {status === "sent" ? (
          <div className="auth-desc" style={{ color: "green" }}>
            Đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>.
            Vui lòng kiểm tra hộp thư của bạn.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>

              <div className="input-wrapper">
                <FiMail className="input-icon" />

                <input
                  type="email"
                  placeholder="email@của bạn.com"
                  value={email}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <p style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}