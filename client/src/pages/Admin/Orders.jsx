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
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiTag,
  FiClock,
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
  const fetchOrders = async (page = 1, keyword = "", status = "", silent = false) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
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
      setOrders((previous) => previous.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      await fetchOrders(
        currentPage,
        search,
        statusFilter,
        true
      );
    } else {
      toast.error(
        data.message || "Không thể chuyển trạng thái này!"
      );

      await fetchOrders(
        currentPage,
        search,
        statusFilter,
        true
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
    return new Intl.NumberFormat('vi-VN').format(Number(amount) || 0) + ' VND';
  };

  const selectedOrderCoupons = (selectedOrder?.order_coupons || []).filter(
    (coupon) => coupon.status !== "released"
  );

  const selectedCouponCodes = selectedOrderCoupons
    .map((coupon) => coupon.code_snapshot)
    .filter(Boolean);

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
          className="order-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
            <button
              type="button"
              className="order-modal-close"
              onClick={() => setSelectedOrder(null)}
              aria-label="Đóng chi tiết đơn hàng"
            >
              <FiX />
            </button>

            <header className="order-modal-header">
              <div>
                <span className="order-modal-eyebrow">CHI TIẾT ĐƠN HÀNG</span>
                <h2 id="order-detail-title">Đơn hàng #{selectedOrder.id}</h2>
                <p className="order-created-at">
                  <FiClock />
                  {selectedOrder.created_at
                    ? new Date(selectedOrder.created_at).toLocaleString("vi-VN")
                    : "Không có thời gian tạo"}
                </p>
              </div>
              <span className={badgeClass(selectedOrder.status)}>
                {translateStatus(selectedOrder.status)}
              </span>
            </header>

            <div className="order-info-grid">
              <section className="order-info-card">
                <div className="order-card-title">
                  <span className="order-card-icon"><FiUser /></span>
                  <h3>Khách hàng</h3>
                </div>
                <dl className="order-detail-list">
                  <div><dt>Họ tên</dt><dd>{selectedOrder.user?.name || "Không có"}</dd></div>
                  <div><dt>Email</dt><dd>{selectedOrder.user?.email || "Không có"}</dd></div>
                  <div><dt>Số điện thoại</dt><dd>{selectedOrder.user?.phone || selectedOrder.shipping_phone || "Không có"}</dd></div>
                </dl>
              </section>

              <section className="order-info-card">
                <div className="order-card-title">
                  <span className="order-card-icon"><FiMapPin /></span>
                  <h3>Địa chỉ giao hàng</h3>
                </div>
                <p className="order-recipient">
                  {selectedOrder.shipping_receiver_name || selectedOrder.address?.receiver_name || "Không có"}
                </p>
                <p className="order-muted">
                  {selectedOrder.shipping_phone || selectedOrder.address?.phone || "Không có"}
                </p>
                <p className="order-address">
                  {[
                    selectedOrder.shipping_street || selectedOrder.address?.street,
                    selectedOrder.shipping_ward || selectedOrder.address?.ward,
                    selectedOrder.shipping_district || selectedOrder.address?.district,
                    selectedOrder.shipping_province || selectedOrder.address?.province,
                  ].filter(Boolean).join(", ") || "Không có"}
                </p>
              </section>

              <section className="order-info-card">
                <div className="order-card-title">
                  <span className="order-card-icon"><FiCreditCard /></span>
                  <h3>Thanh toán</h3>
                </div>
                <div className="payment-heading-row">
                  <strong>{translatePaymentMethod(selectedOrder.payment_method)}</strong>
                  <span className={`payment-pill payment-${selectedOrder.payment_status || "unpaid"}`}>
                    {translatePaymentStatus(selectedOrder.payment_status)}
                  </span>
                </div>

                {selectedOrder.payment_method === "vnpay" ? (
                  <dl className="order-detail-list compact">
                    <div><dt>Mã VNPay</dt><dd>{selectedOrder.vnpay_txn_ref || "—"}</dd></div>
                    <div><dt>Mã giao dịch</dt><dd>{selectedOrder.vnpay_transaction_no || "—"}</dd></div>
                    <div><dt>Response code</dt><dd>{selectedOrder.vnpay_response_code || "—"}</dd></div>
                  </dl>
                ) : (
                  <p className="cod-message">Thu tiền trực tiếp khi khách nhận hàng.</p>
                )}

                <p className="paid-at">
                  {selectedOrder.paid_at
                    ? `Thanh toán lúc ${new Date(selectedOrder.paid_at).toLocaleString("vi-VN")}`
                    : "Chưa ghi nhận thời gian thanh toán"}
                </p>
              </section>
            </div>

            <section className="order-products-section">
              <div className="order-section-title">
                <div>
                  <span className="order-card-icon"><FiPackage /></span>
                  <h3>Sản phẩm</h3>
                </div>
                <span>{(selectedOrder.items || []).length} sản phẩm</span>
              </div>

              <div className="order-product-list">
                {(selectedOrder.items || []).map((orderItem) => {
                  const variant = orderItem.product_variant;
                  const product = variant?.product;
                  const productName = orderItem.product_name_snapshot || product?.name || "Sản phẩm đã xóa";
                  const productImage = orderItem.variant_image_snapshot || variant?.image_url || variant?.image || product?.thumbnail || "/images/placeholder.png";
                  const variantColor = orderItem.variant_color_snapshot || variant?.color || "—";
                  const variantSize = orderItem.variant_size_snapshot || variant?.size || "—";

                  return (
                    <article className="order-product-item" key={orderItem.id}>
                      <img src={productImage} alt={productName} />
                      <div className="order-product-info">
                        <strong>{productName}</strong>
                        <p>{variantColor} / {variantSize}</p>
                        <span>Số lượng: {orderItem.quantity}</span>
                      </div>
                      <div className="order-product-price">
                        <span>{formatVND(orderItem.price)} × {orderItem.quantity}</span>
                        <strong>{formatVND(Number(orderItem.price) * Number(orderItem.quantity))}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="order-footer-grid">
              <section className="order-note-card">
                <h3>Ghi chú đơn hàng</h3>
                <p>{selectedOrder.note || "Khách hàng không để lại ghi chú."}</p>
              </section>

              <section className="order-summary-card">
                <div className="summary-line">
                  <span>Tạm tính</span>
                  <strong>{formatVND(selectedOrder.subtotal)}</strong>
                </div>
                <div className="summary-line">
                  <span>Phí vận chuyển</span>
                  <strong>{formatVND(selectedOrder.shipping_fee)}</strong>
                </div>

                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="summary-line discount-line">
                    <span>Giảm giá sản phẩm</span>
                    <strong>-{formatVND(selectedOrder.discount_amount)}</strong>
                  </div>
                )}
                {Number(selectedOrder.shipping_discount) > 0 && (
                  <div className="summary-line discount-line">
                    <span>Giảm phí vận chuyển</span>
                    <strong>-{formatVND(selectedOrder.shipping_discount)}</strong>
                  </div>
                )}

                <div className="voucher-summary">
                  <span><FiTag /> Voucher áp dụng</span>
                  {selectedCouponCodes.length ? (
                    <div className="voucher-code-list">
                      {selectedCouponCodes.map((code, index) => (
                        <strong key={`${code}-${index}`}>{code}</strong>
                      ))}
                    </div>
                  ) : (
                    <em>Không sử dụng voucher</em>
                  )}
                </div>

                <div className="summary-total">
                  <span>Tổng thanh toán</span>
                  <strong>{formatVND(selectedOrder.total_amount)}</strong>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
