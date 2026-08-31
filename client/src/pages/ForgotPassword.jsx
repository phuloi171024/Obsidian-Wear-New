import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { authService } from "../services/authService";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (event) => {
    setEmail(event.target.value);

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setError("");

    if (!normalizedEmail) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("Địa chỉ email không hợp lệ.");
      return;
    }

    setStatus("loading");

    try {
      const data = await authService.forgotPassword(
        normalizedEmail
      );

      if (data?.status === true) {
        setSubmittedEmail(normalizedEmail);
        setStatus("sent");
        return;
      }

      setStatus("idle");
      setError(
        data?.message ||
          "Không thể gửi yêu cầu đặt lại mật khẩu."
      );
    } catch (err) {
      setStatus("idle");

      const responseData = err?.response?.data;
      const httpStatus = err?.response?.status;

      if (httpStatus === 429) {
        setError(
          "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 10 phút rồi thử lại."
        );
      } else if (responseData?.errors?.email?.[0]) {
        setError(responseData.errors.email[0]);
      } else if (responseData?.message) {
        setError(responseData.message);
      } else if (!err?.response) {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra Laravel đang chạy."
        );
      } else {
        setError(
          "Máy chủ không thể xử lý yêu cầu. Vui lòng thử lại."
        );
      }

      console.error("Forgot password error:", {
        status: httpStatus,
        data: responseData,
        error: err,
      });
    }
  };

  const handleSendAgain = () => {
    setStatus("idle");
    setSubmittedEmail("");
    setError("");
  };

  const alertStyle = {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "18px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px",
    lineHeight: 1.6,
    textAlign: "center",
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link to="/" aria-label="Về trang chủ">
          <img
            src="/images/logo.png"
            alt="Obsidian Wear"
            className="auth-logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </Link>

        <h2>Quên mật khẩu</h2>

        {status === "sent" ? (
          <>
            <div style={alertStyle} role="status">
              <p
                style={{
                  margin: "0 0 8px",
                  fontWeight: 600,
                }}
              >
                Yêu cầu đã được tiếp nhận
              </p>

              <p style={{ margin: 0 }}>
                Nếu địa chỉ{" "}
                <strong
                  style={{
                    wordBreak: "break-all",
                  }}
                >
                  {submittedEmail}
                </strong>{" "}
                tồn tại trong hệ thống, liên kết đặt lại mật
                khẩu sẽ được gửi đến hộp thư này.
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13px",
                  opacity: 0.9,
                }}
              >
                Vui lòng kiểm tra cả hộp thư đến và thư rác.
              </p>
            </div>

            <button
              type="button"
              className="auth-submit"
              onClick={handleSendAgain}
            >
              Gửi yêu cầu khác
            </button>
          </>
        ) : (
          <>
            <div className="auth-desc">
              Nhập địa chỉ email của bạn. Nếu email tồn tại
              trong hệ thống, chúng tôi sẽ gửi liên kết đặt lại
              mật khẩu.
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="forgot-password-email">
                  E-mail
                </label>

                <div className="input-wrapper">
                  <FiMail
                    className="input-icon"
                    aria-hidden="true"
                  />

                  <input
                    id="forgot-password-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@cuaban.com"
                    value={email}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error
                        ? "forgot-password-error"
                        : undefined
                    }
                    required
                  />
                </div>

                {error && (
                  <p
                    id="forgot-password-error"
                    role="alert"
                    style={{
                      color: "#dc2626",
                      fontSize: "13px",
                      marginTop: "6px",
                      marginBottom: 0,
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Đang xử lý..."
                  : "Gửi liên kết đặt lại mật khẩu"}
              </button>
            </form>
          </>
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