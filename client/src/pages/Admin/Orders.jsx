import "./Orders.css";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================= 1. LẤY DANH SÁCH ĐƠN HÀNG TỪ API =================
  const fetchOrders = async (page = 1, keyword = "", status = "") => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      let url = `http://localhost:8000/api/admin/orders?page=${page}`;
      if (keyword) url += `&search=${keyword}`;
      if (status) url += `&status=${status}`;

      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        setOrders(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, search, statusFilter);
  }, [currentPage, statusFilter]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchOrders(1, search, statusFilter);
    }
  };

  // ================= HÀM RELOAD DANH SÁCH =================
  const handleReload = () => {
    setSearch("");
    setStatusFilter("");
    setCurrentPage(1);
    fetchOrders(1, "", "");
    toast.success("Đã làm mới danh sách đơn hàng!");
  };

  // ================= 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG =================
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Cập nhật trạng thái thành công!");
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error(data.message || "Không thể chuyển trạng thái này!");
        fetchOrders(currentPage, search, statusFilter);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  const badgeClass = (status) => {
    switch (status) {
      case "shipped":
        return "badge shipping";
      case "cancelled":
        return "badge cancel";
      case "pending":
        return "badge pending";
      case "completed":
        return "badge success";
      default:
        return "badge pending";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "shipped": return "Đang giao";
      case "completed": return "Hoàn tất";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  return (
    <div className="orders-page">
      <Toaster position="top-right" />

      <div className="orders-header">
        <div>
          <h2>Quản lí đơn hàng</h2>
        </div>
        <div className="header-action">
          <button className="icon-btn">
            <FiMoreHorizontal />
          </button>
          {/* ĐÃ XÓA NÚT TẠO ĐƠN MỚI */}
        </div>
      </div>

      <div className="filter-bar">
        {/* Lọc theo trạng thái */}
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="shipped">Đang giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email khách hàng (Nhấn Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* THAY THẾ ICON LỌC BẰNG NÚT RELOAD */}
        <button className="filter-btn" onClick={handleReload} title="Tải lại danh sách">
          <FiRefreshCw />
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Ngày tạo</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái (Cập nhật)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>Đang tải danh sách đơn hàng...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#888" }}>Không tìm thấy đơn hàng nào.</td></tr>
            ) : (
              orders.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>#{item.id}</td>
                  <td>{new Date(item.created_at).toLocaleString("vi-VN")}</td>
                  <td>{item.user?.name || "Khách lẻ"}</td>
                  <td style={{ fontWeight: "600", color: "#10b981" }}>{formatVND(item.total_amount)}</td>
                  <td>COD / Chuyển khoản</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className={badgeClass(item.status)}>
                        {translateStatus(item.status)}
                      </span>

                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none", cursor: "pointer", fontSize: "13px" }}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="shipped">Đang giao</option>
                        <option value="completed">Hoàn tất</option>
                        <option value="cancelled">Hủy đơn</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <FiChevronLeft />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}