import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import "./ProfilePage.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiClipboard,
  FiLock,
  FiLogOut,
  FiEdit,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  // 1. Kiểm tra token và gọi API lấy thông tin profile chuẩn route Laravel
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Vui lòng đăng nhập để xem thông tin cá nhân!");
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Khớp chính xác với Route::get('/user/profile', ...) trong Laravel
        const response = await fetch("http://localhost:8000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            // Đã thêm .trim() để dọn sạch khoảng trắng ẩn bị dư
            "Authorization": `Bearer ${token.trim()}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          // Xử lý dữ liệu linh hoạt theo cấu trúc trả về của controller
          const userData = data.data || data;
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || ""
          });
        } else {
          if (response.status === 401) {
            localStorage.removeItem("access_token");
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        toast.error("Không thể kết nối đến máy chủ!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // 2. Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  // 3. Xử lý thay đổi input trên form
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // 4. Xử lý cập nhật thông tin (Khớp với Route::put('/user/profile', ...))
  const handleUpdate = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:8000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Đã thêm .trim() để dọn sạch khoảng trắng ẩn bị dư
          "Authorization": `Bearer ${token.trim()}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          address: user.address
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Cập nhật thông tin thành công!");
        if (data.data || data) {
          localStorage.setItem("user_info", JSON.stringify(data.data || data));
        }
      } else {
        toast.error(data.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "100px" }}>Đang tải thông tin...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="orders-page">
        <div className="account-layout">
          
          {/* Sidebar */}
          <div className="account-sidebar">
            <h2>Tài khoản của tôi</h2>

            <div className="user-info">
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div>
                <h4>{user.name || "Khách hàng"}</h4>
                <span>{user.email}</span>
              </div>
            </div>

            <ul className="account-menu">
              <li className="active">
                <Link to="/profile">
                  <FiUser />
                  Thông tin cá nhân
                </Link>
              </li>

              <li>
                <Link to="/orders">
                  <FiClipboard />
                  Đơn hàng của tôi
                </Link>
              </li>

              <li>
                <FiLock />
                Đổi mật khẩu
              </li>

              <li className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}>
                <FiLogOut />
                Đăng xuất
              </li>
            </ul>
          </div>

          {/* Content */}
          <div className="profile-content">
            <div className="profile-header">
              <h2>
                <FiEdit />
                Thông tin cá nhân
              </h2>
              <span>* Thông tin bắt buộc</span>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input 
                  name="name" 
                  value={user.name} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  name="email" 
                  value={user.email} 
                  disabled 
                  style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input 
                  name="phone" 
                  value={user.phone} 
                  onChange={handleChange} 
                  placeholder="Chưa cập nhật số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input 
                  name="address" 
                  value={user.address} 
                  onChange={handleChange} 
                  placeholder="Chưa cập nhật địa chỉ"
                />
              </div>
            </div>

            <div className="profile-btn">
              <button onClick={handleUpdate}>Cập nhật thông tin</button>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}