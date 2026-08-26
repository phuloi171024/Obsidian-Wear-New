import { API_BASE_URL } from "../../config/api";
import "./Orders.css";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiX,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================= 1. LẤY DANH SÁCH ĐƠN HÀNG TỪ API =================
  const fetchOrders = async (page = 1, keyword = "", status = "") => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      let url = `${API_BASE_URL}/admin/orders?page=${page}`;
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
  if (newStatus === "cancelled") {
    const confirmed = window.confirm(
      "Hủy đơn sẽ hoàn lại tồn kho và lượt sử dụng voucher. Bạn chắc chắn muốn tiếp tục?"
    );

    if (!confirmed) {
      return;
    }
  }

  const token = localStorage.getItem("access_token");

  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.status) {
      toast.success(
        data.message || "Cập nhật trạng thái thành công!"
      );

      /*
       * Tải lại từ backend để cập nhật cả trạng thái
       * thanh toán, paid_at, tồn kho và bộ lọc.
       */
      await fetchOrders(
        currentPage,
        search,
        statusFilter
      );
    } else {
      toast.error(
        data.message || "Không thể chuyển trạng thái này!"
      );

      await fetchOrders(
        currentPage,
        search,
        statusFilter
      );
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
  const translatePaymentMethod = (method) => {
  switch (method) {
    case "cod":
      return "COD";
    case "vnpay":
      return "VNPay";
    default:
      return method || "Không xác định";
  }
};

const translatePaymentStatus = (status) => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "pending":
      return "Đang chờ thanh toán";
    case "failed":
      return "Thanh toán thất bại";
    case "unpaid":
      return "Chưa thanh toán";
    default:
      return status || "Không xác định";
  }
};

const paymentStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "#16a34a";
    case "pending":
      return "#d97706";
    case "failed":
      return "#dc2626";
    default:
      return "#64748b";
  }
};

const getAllowedStatuses = (order) => {
  if (order.status === "pending") {
    const statuses = ["cancelled"];

    /*
     * COD có thể giao khi chưa thu tiền.
     * VNPay chỉ được giao sau khi đã thanh toán.
     */
    if (
      order.payment_method !== "vnpay" ||
      order.payment_status === "paid"
    ) {
      statuses.unshift("shipped");
    }

    return statuses;
  }

  if (order.status === "shipped") {
    return ["completed"];
  }

  return [];
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
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Đang tải danh sách đơn hàng...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#888" }}>Không tìm thấy đơn hàng nào.</td></tr>
            ) : (
              orders.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "600" }}>#{item.id}</td>
                  <td>{new Date(item.created_at).toLocaleString("vi-VN")}</td>
                  <td>{item.user?.name || "Khách lẻ"}</td>
                  <td style={{ fontWeight: "600", color: "#10b981" }}>{formatVND(item.total_amount)}</td>
                  <td>
  <div style={{ fontWeight: "600" }}>
    {translatePaymentMethod(item.payment_method)}
  </div>

  <div
    style={{
      marginTop: "4px",
      fontSize: "12px",
      color: paymentStatusColor(item.payment_status),
    }}
  >
    {translatePaymentStatus(item.payment_status)}
  </div>
</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className={badgeClass(item.status)}>
                        {translateStatus(item.status)}
                      </span>

                      <select
  value={item.status}
  disabled={getAllowedStatuses(item).length === 0}
  onChange={(e) =>
    handleStatusChange(item.id, e.target.value)
  }
  style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
    cursor:
      getAllowedStatuses(item).length === 0
        ? "not-allowed"
        : "pointer",
    fontSize: "13px",
    opacity:
      getAllowedStatuses(item).length === 0
        ? 0.6
        : 1,
  }}
>
  <option value={item.status}>
    {translateStatus(item.status)}
  </option>

  {getAllowedStatuses(item).map((status) => (
    <option key={status} value={status}>
      {translateStatus(status)}
    </option>
  ))}
</select>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setSelectedOrder(item)}
                      title="Xem chi tiết đơn"
                    >
                      <FiEye />
                    </button>
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

      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "14px",
              padding: "24px",
              position: "relative",
            }}
          >
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSelectedOrder(null)}
              style={{ position: "absolute", top: 16, right: 16 }}
            >
              <FiX />
            </button>

            <h2>Chi tiết đơn #{selectedOrder.id}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <h4>Khách hàng</h4>
                <p>{selectedOrder.user?.name || "Không có"}</p>
                <p>{selectedOrder.user?.email || ""}</p>
                <p>{selectedOrder.user?.phone || ""}</p>
              </div>
              <div>
                <h4>Địa chỉ giao hàng</h4>
                <p>{selectedOrder.address?.receiver_name || "Không có"}</p>
                <p>{selectedOrder.address?.phone || ""}</p>
                <p>
                  {[
                    selectedOrder.address?.street,
                    selectedOrder.address?.ward,
                    selectedOrder.address?.district,
                    selectedOrder.address?.province,
                  ].filter(Boolean).join(", ") || "Không có"}
                </p>
              </div>
              <div>
                <h4>Thanh toán</h4>
                <p>{translatePaymentMethod(selectedOrder.payment_method)}</p>
                <p>{translatePaymentStatus(selectedOrder.payment_status)}</p>
                <p>Mã VNPay: {selectedOrder.vnpay_txn_ref || "—"}</p>
                <p>Mã giao dịch: {selectedOrder.vnpay_transaction_no || "—"}</p>
                <p>Response code: {selectedOrder.vnpay_response_code || "—"}</p>
                <p>Thanh toán lúc: {selectedOrder.paid_at ? new Date(selectedOrder.paid_at).toLocaleString("vi-VN") : "—"}</p>
              </div>
            </div>

            <h4>Sản phẩm</h4>
            {(selectedOrder.items || []).map((orderItem) => {
              const variant = orderItem.product_variant;
              const product = variant?.product;
              return (
                <div key={orderItem.id} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <img src={product?.thumbnail || "/images/placeholder.png"} alt={product?.name || "Sản phẩm"} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <strong>{product?.name || "Sản phẩm đã xóa"}</strong>
                    <div>{variant?.color || "—"} / {variant?.size || "—"}</div>
                    <div>Số lượng: {orderItem.quantity}</div>
                  </div>
                  <strong>{formatVND(orderItem.price)}</strong>
                </div>
              );
            })}

            <div style={{ marginTop: 18, textAlign: "right" }}>
              <p>Voucher: {selectedOrder.coupon?.code || "Không dùng"}</p>
              <p>Ghi chú: {selectedOrder.note || "Không có"}</p>
              <h3>Tổng cộng: {formatVND(selectedOrder.total_amount)}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
