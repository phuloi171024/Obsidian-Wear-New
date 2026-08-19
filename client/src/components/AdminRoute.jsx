import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminRoute() {
  const token = localStorage.getItem("access_token");
  const userInfoStr = localStorage.getItem("user_info");
  
  let userInfo = null;
  try {
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr);
    }
  } catch (error) {
    console.error("Lỗi đọc thông tin user");
  }

  // Nếu không có token hoặc role không phải admin thì đá về trang chủ / trang đăng nhập
  if (!token || !userInfo || userInfo.role !== "admin") {
    toast.error("Bạn không có quyền truy cập trang Quản trị!");
    return <Navigate to="admin/login" replace />;
  }

  // Nếu đúng là admin, cho phép hiển thị các trang con bên trong (Dashboard, Products...)
  return <Outlet />;
}