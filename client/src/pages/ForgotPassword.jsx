import { useState } from "react";
import "./Auth.css"; // Vẫn giữ lại để ăn các class chung như auth-page, auth-box, auth-logo...
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
    setTimeout(() => {
      setStatus("sent");
    }, 1000);
  };

  // Định nghĩa CSS Alert ngay trong file này luôn
  const alertStyle = {
    backgroundColor: "#f0fdf4",   // Nền xanh lá nhẹ nhành
    border: "1px solid #bbf7d0", // Viền xanh chỉn chu
    color: "#166534",           // Màu chữ xanh đậm sang xịn
    padding: "18px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px",
    lineHeight: "1.6",
    textAlign: "center",
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

        {status === "sent" ? (
          /* Khung thông báo gộp chung CSS */
          <div style={alertStyle}>
            <p style={{ margin: "0 0 4px 0" }}>
              Đã gửi liên kết đặt lại mật khẩu đến:
            </p>
            <strong style={{ color: "#14532d", wordBreak: "break-all", display: "block", margin: "4px 0" }}>
              {email}
            </strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
              Vui lòng kiểm tra hộp thư của bạn.
            </p>
          </div>
        ) : (
          <>
            <div className="auth-desc">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi một liên kết đặt lại mật khẩu
            </div>

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
                  <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px", textAlign: "left" }}>
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
          </>
        )}

        <div className="auth-footer">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}