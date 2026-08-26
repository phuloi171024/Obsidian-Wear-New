import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";
import { authService } from "../services/authService";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Trao đổi google_code dùng một lần để nhận Sanctum token.
  useEffect(() => {
    const googleCode = searchParams.get("google_code");
    const errorCode = searchParams.get("error");

    if (errorCode) {
      const errorMessages = {
        account_disabled: "Tài khoản của bạn đã bị khóa!",
        invalid_oauth_state:
          "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại!",
        google_account_mismatch:
          "Email này đã được liên kết với một tài khoản Google khác!",
        google_login_failed:
          "Xác thực Google thất bại. Vui lòng thử lại!",
      };

      toast.error(
        errorMessages[errorCode] ||
          "Xác thực Google thất bại. Vui lòng thử lại!"
      );

      navigate("/login", { replace: true });
      return;
    }

    if (!googleCode) {
      return;
    }

    // Ngăn React StrictMode trao đổi cùng một mã hai lần.
    const exchangeMarker = `google_exchange_${googleCode}`;

    if (sessionStorage.getItem(exchangeMarker)) {
      return;
    }

    sessionStorage.setItem(exchangeMarker, "processing");

    const exchangeGoogleCode = async () => {
      try {
        const data = await authService.exchangeGoogleCode(googleCode);

        if (!data?.access_token) {
          throw new Error(
            data?.message || "Không thể hoàn tất xác thực Google!"
          );
        }

        localStorage.setItem("access_token", data.access_token);

        if (data.data) {
          localStorage.setItem("user_info", JSON.stringify(data.data));
        }

        window.dispatchEvent(new Event("loginSuccess"));

        toast.success(
          data.is_new_user
            ? "Đăng ký bằng Google thành công!"
            : "Đăng nhập Google thành công!"
        );

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } catch (error) {
        sessionStorage.removeItem(exchangeMarker);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Xác thực Google thất bại!";

        toast.error(message);
        navigate("/login", { replace: true });
      }
    };

    exchangeGoogleCode();
  }, [searchParams, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      const data = await authService.login(email, password);
      const token = data?.access_token || data?.token;

      if (!token) {
        throw new Error(
          data?.message || "Email hoặc mật khẩu không chính xác!"
        );
      }

      localStorage.setItem("access_token", token);

      if (data.data) {
        localStorage.setItem("user_info", JSON.stringify(data.data));
      }

      window.dispatchEvent(new Event("loginSuccess"));
      toast.success(data.message || "Đăng nhập thành công!");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      const validationMessage = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).flat()[0]
        : null;

      toast.error(
        validationMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Không thể kết nối đến máy chủ!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) {
      return;
    }

    try {
      setIsGoogleLoading(true);

      const data = await authService.getGoogleLoginUrl();

      if (!data?.status || !data?.url) {
        throw new Error(
          data?.message || "Không thể tải trang đăng nhập Google!"
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("Lỗi Google Login:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể kết nối đến máy chủ!"
      );

      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="auth-page">
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

          <h2>Đăng nhập tài khoản</h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email *</label>

              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Mật khẩu *</label>

              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />

                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((current) => !current)}
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setShowPassword((current) => !current);
                    }
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="auth-row">
              <label className="checkbox" style={{ margin: 0 }}>
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>

              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="auth-submit"
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <div className="auth-divider">
            <span>Hoặc đăng nhập với</span>
          </div>

          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            <FcGoogle style={{ fontSize: "20px", marginRight: "10px" }} />
            {isGoogleLoading ? "Đang chuyển hướng..." : "Tiếp tục với Google"}
          </button>

          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </>
  );
}