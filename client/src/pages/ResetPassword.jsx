import { API_BASE_URL } from "../config/api";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy token và email từ liên kết trong email
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Link thiếu token hoặc email
  const invalidLink = !token || !email;

  const getFirstError = (errors) => {
    if (!errors || typeof errors !== "object") {
      return null;
    }

    const firstError = Object.values(errors)[0];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    return firstError;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (invalidLink) {
      setFormError(
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc bị thiếu thông tin!"
      );
      return;
    }

    if (!password || !passwordConfirmation) {
      setFormError("Vui lòng nhập đầy đủ mật khẩu mới!");
      return;
    }

    if (password.length < 8) {
      setFormError("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    if (password !== passwordConfirmation) {
      setFormError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token,
            password,
            password_confirmation: passwordConfirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== true) {
        const message =
          getFirstError(data.errors) ||
          data.message ||
          "Không thể đặt lại mật khẩu!";

        throw new Error(message);
      }

      // Xóa phiên đăng nhập cũ ở trình duyệt
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");

      setIsSuccess(true);
      toast.success(
        data.message || "Đặt lại mật khẩu thành công!"
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (error) {
      console.error("Reset password error:", error);

      const message =
        error.message ||
        "Có lỗi xảy ra. Vui lòng yêu cầu liên kết mới!";

      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Toaster position="top-right" />

      <div className="auth-box">
        <Link to="/">
          <img
            src="/images/logo.png"
            alt="Obsidian Wear"
            className="auth-logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </Link>

        <h2>Đặt lại mật khẩu</h2>

        {invalidLink ? (
          <>
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Liên kết đặt lại mật khẩu không hợp lệ hoặc bị
              thiếu thông tin. Vui lòng yêu cầu một liên kết mới.
            </div>

            <div className="auth-footer">
              <Link to="/forgot-password">
                Yêu cầu liên kết mới
              </Link>
            </div>
          </>
        ) : isSuccess ? (
          <>
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                backgroundColor: "#f0fdf4",
                color: "#166534",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Đặt lại mật khẩu thành công. Đang chuyển đến trang
              đăng nhập...
            </div>

            <div className="auth-footer">
              <Link to="/login">Đi đến trang đăng nhập</Link>
            </div>
          </>
        ) : (
          <>
            <div className="auth-desc">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>E-mail</label>

                <div className="input-wrapper">
                  <FiMail className="input-icon" />

                  <input
                    type="email"
                    value={email}
                    autoComplete="email"
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu mới *</label>

                <div className="input-wrapper">
                  <FiLock className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFormError("");
                    }}
                    placeholder="Nhập ít nhất 8 ký tự"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="eye-icon"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>

                <div className="input-wrapper">
                  <FiLock className="input-icon" />

                  <input
                    type={
                      showPasswordConfirmation
                        ? "text"
                        : "password"
                    }
                    value={passwordConfirmation}
                    onChange={(event) => {
                      setPasswordConfirmation(
                        event.target.value
                      );
                      setFormError("");
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="eye-icon"
                    onClick={() =>
                      setShowPasswordConfirmation(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPasswordConfirmation
                        ? "Ẩn mật khẩu xác nhận"
                        : "Hiện mật khẩu xác nhận"
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {showPasswordConfirmation ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>
                </div>
              </div>

              {formError && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "13px",
                    marginTop: "0",
                    marginBottom: "14px",
                    textAlign: "left",
                  }}
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Đang cập nhật..."
                  : "Đặt lại mật khẩu"}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/login">← Quay lại đăng nhập</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}