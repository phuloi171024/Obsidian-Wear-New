import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await res.json(); // Đổi tên biến tránh trùng lặp chữ data

      if (res.ok && responseData.access_token) {
        
        // CHỈNH SỬA TẠI ĐÂY: Lấy đúng object thông tin từ responseData.data
        const userObj = responseData.data;

        // KIỂM TRA QUYỀN ADMIN
        if (userObj.role !== "admin") {
          toast.error("Tài khoản của bạn không có quyền truy cập trang quản trị!");
          setLoading(false);
          return;
        }

        // Lưu thông tin phiên làm việc
        localStorage.setItem("access_token", responseData.access_token);
        localStorage.setItem("user_info", JSON.stringify(userObj));

        toast.success("Đăng nhập quản trị thành công!");
        setTimeout(() => {
          navigate("/admin"); // Chuyển hướng vào Dashboard
        }, 1000);
      } else {
        toast.error(responseData.message || "Email hoặc mật khẩu không chính xác!");
      }
    } catch (error) {
      console.error(error); // In lỗi ra F12 để dễ kiểm tra
      toast.error("Lỗi xử lý dữ liệu hoặc kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fb", fontFamily: "sans-serif" }}>
      <Toaster position="top-right" />
      <div style={{ width: "100%", maxWidth: "420px", background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img src="/src/public/images/logo.png" alt="Logo" style={{ height: "60px", width: "auto", objectFit: "contain", marginBottom: "10px" }} />
          <h2 style={{ color: "#111827", marginTop: "15px", marginBottom: "5px", fontSize: "24px" }}>Quản trị viên</h2>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Đăng nhập vào bảng điều khiển Obsidian</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#374151" }}>Email quản trị *</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@obsidian.com"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#374151" }}>Mật khẩu *</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", background: "#2563eb", color: "#fff", padding: "14px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}