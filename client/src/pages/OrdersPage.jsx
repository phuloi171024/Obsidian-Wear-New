import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiClipboard,
  FiCreditCard,
  FiEye,
  FiMapPin,
  FiRefreshCw,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../config/api";
import Footer from "../components/Footer";
import "./ProfilePage.css";
import "./OrdersPage.css";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23eeeeee'/%3E%3Cpath d='M25 82l22-25 15 17 12-13 21 21z' fill='%23c5c5c5'/%3E%3Ccircle cx='43' cy='38' r='9' fill='%23c5c5c5'/%3E%3C/svg%3E";

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  shipped: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const PAYMENT_STATUS_LABELS = {
  paid: "Thành công",
  pending: "Chờ thanh toán",
  unpaid: "Chưa thanh toán",
  failed: "Thanh toán thất bại",
  expired: "Đã hết hạn",
  refunded: "Đã hoàn tiền",
};

const FILTER_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "shipped", label: "Đang giao" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancelled", label: "Đã hủy" },
];

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const paymentMethodLabel = (method) =>
  method === "vnpay" ? "VNPay" : method === "cod" ? "COD" : "Không xác định";

const orderCoupons = (order) =>
  (order?.order_coupons || order?.orderCoupons || []).filter(
    (coupon) => coupon?.status !== "released"
  );

const firstValidationMessage = (data) =>
  data?.errors ? Object.values(data.errors).flat().find(Boolean) : null;

const itemSnapshot = (item) => {
  const variant = item?.product_variant || item?.productVariant;
  const product = variant?.product;
  const galleryImage = product?.images?.[0];

  return {
    name:
      item?.product_name_snapshot ||
      product?.name ||
      "Sản phẩm không còn tồn tại",
    sku: item?.product_sku_snapshot || product?.sku || "",
    color:
      item?.variant_color_snapshot ||
      variant?.color ||
      "Không xác định",
    size:
      item?.variant_size_snapshot ||
      variant?.size ||
      "Không xác định",
    image:
      item?.variant_image_snapshot ||
      variant?.image_url ||
      variant?.image ||
      product?.thumbnail_url ||
      product?.thumbnail ||
      galleryImage?.image_url ||
      galleryImage?.url ||
      galleryImage?.image ||
      FALLBACK_IMAGE,
  };
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [detailOrderId, setDetailOrderId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const listControllerRef = useRef(null);
  const detailControllerRef = useRef(null);
  const listRequestRef = useRef(0);
  const detailRequestRef = useRef(0);
  const cancelLocksRef = useRef(new Set());
  const paymentLocksRef = useRef(new Set());

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
    };
  }, []);

  const forceLogin = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchOrders = useCallback(async ({ showToast = false, silent = false } = {}) => {
    const requestId = listRequestRef.current + 1;
    listRequestRef.current = requestId;
    listControllerRef.current?.abort();
    const controller = new AbortController();
    listControllerRef.current = controller;

    try {
      if (!silent) setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: getHeaders(),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (requestId !== listRequestRef.current) return false;

      if (response.status === 401) {
        forceLogin();
        return false;
      }

      if (!response.ok || data.status === false) {
        throw new Error(
          firstValidationMessage(data) ||
            data.message ||
            "Không thể tải lịch sử đơn hàng!"
        );
      }

      const responseOrders = data.orders?.data || data.orders || data.data || [];
      setOrders(Array.isArray(responseOrders) ? responseOrders : []);
      if (showToast) toast.success("Đã làm mới danh sách!");
      return true;
    } catch (error) {
      if (error.name === "AbortError" || requestId !== listRequestRef.current) {
        return false;
      }
      console.error("Lỗi tải đơn hàng:", error);
      toast.error(error.message || "Không thể tải lịch sử đơn hàng!");
      return false;
    } finally {
      if (!silent && requestId === listRequestRef.current) setLoading(false);
    }
  }, [forceLogin, getHeaders]);

  const closeOrderDetail = useCallback(() => {
    detailControllerRef.current?.abort();
    detailRequestRef.current += 1;
    setDetailOrderId(null);
    setSelectedOrder(null);
    setDetailError("");
    setDetailLoading(false);
  }, []);

  const fetchOrderDetail = useCallback(async (orderId, { silent = false } = {}) => {
    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    detailControllerRef.current?.abort();
    const controller = new AbortController();
    detailControllerRef.current = controller;

    if (!silent) {
      setDetailOrderId(orderId);
      setSelectedOrder(null);
      setDetailError("");
      setDetailLoading(true);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`,
        { headers: getHeaders(), signal: controller.signal }
      );
      const data = await response.json().catch(() => ({}));

      if (requestId !== detailRequestRef.current) return null;
      if (response.status === 401) {
        forceLogin();
        return null;
      }
      if (!response.ok || data.status === false) {
        throw new Error(
          firstValidationMessage(data) || data.message || "Không thể tải chi tiết đơn hàng!"
        );
      }

      const currentOrder = data.order || data.data || data;
      if (!currentOrder?.id) throw new Error("Dữ liệu đơn hàng không hợp lệ!");
      setSelectedOrder(currentOrder);
      setDetailOrderId(currentOrder.id);
      setDetailError("");
      return currentOrder;
    } catch (error) {
      if (error.name === "AbortError" || requestId !== detailRequestRef.current) {
        return null;
      }
      setDetailError(error.message || "Không thể tải chi tiết đơn hàng!");
      if (silent) toast.error(error.message || "Không thể cập nhật chi tiết đơn hàng!");
      return null;
    } finally {
      if (!silent && requestId === detailRequestRef.current) setDetailLoading(false);
    }
  }, [forceLogin, getHeaders]);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      toast.error("Vui lòng đăng nhập để xem lịch sử đơn hàng!");
      forceLogin();
      return;
    }

    fetchOrders();

    return () => {
      listControllerRef.current?.abort();
      detailControllerRef.current?.abort();
    };
  }, [fetchOrders, forceLogin]);

  useEffect(() => {
    const refreshVisibleData = () => {
      if (document.visibilityState !== "visible") return;
      fetchOrders({ silent: true });
      if (detailOrderId) fetchOrderDetail(detailOrderId, { silent: true });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshVisibleData();
    };

    window.addEventListener("focus", refreshVisibleData);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", refreshVisibleData);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [detailOrderId, fetchOrderDetail, fetchOrders]);

  const handleLogout = async () => {
    try {
      if (localStorage.getItem("access_token")) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: getHeaders(),
        });
      }
    } catch (error) {
      console.error("Không thể thu hồi token:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user_info");
      toast.success("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    }
  };

  const executeCancelOrder = async () => {
    const orderId = confirmCancelId;
    if (!orderId || cancelLocksRef.current.has(orderId)) return;
    cancelLocksRef.current.add(orderId);

    try {
      setCancelingId(orderId);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        forceLogin();
        return;
      }

      if (!response.ok || data.status === false) {
        throw new Error(
          firstValidationMessage(data) ||
            data.message ||
            "Không thể hủy đơn hàng này!"
        );
      }

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "cancelled",
                payment_status:
                  order.payment_method === "vnpay" ? "failed" : order.payment_status,
              }
            : order
        )
      );
      setSelectedOrder((previous) =>
        previous?.id === orderId
          ? {
              ...previous,
              status: "cancelled",
              payment_status:
                previous.payment_method === "vnpay" ? "failed" : previous.payment_status,
              order_coupons: (previous.order_coupons || []).map((coupon) => ({
                ...coupon,
                status: "released",
              })),
            }
          : previous
      );
      toast.success(data.message || "Đã hủy đơn, hoàn kho và trả voucher!");
      await fetchOrders({ silent: true });
      if (detailOrderId === orderId) {
        await fetchOrderDetail(orderId, { silent: true });
      }
    } catch (error) {
      toast.error(error.message || "Không thể hủy đơn hàng này!");
    } finally {
      cancelLocksRef.current.delete(orderId);
      setCancelingId(null);
      setConfirmCancelId(null);
    }
  };

  const retryVnpayPayment = async (orderId) => {
    if (paymentLocksRef.current.has(orderId)) return;
    paymentLocksRef.current.add(orderId);
    try {
      setPayingId(orderId);
      const response = await fetch(`${API_BASE_URL}/vnpay/create`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        forceLogin();
        return;
      }

      const paymentUrl = data.url || data.payment_url || data.data?.url || data.data;
      if (!response.ok || typeof paymentUrl !== "string") {
        throw new Error(data.message || "Không thể tạo liên kết VNPay mới!");
      }

      window.location.assign(paymentUrl);
    } catch (error) {
      toast.error(error.message || "Không thể tạo liên kết VNPay mới!");
    } finally {
      paymentLocksRef.current.delete(orderId);
      setPayingId(null);
    }
  };

  const filteredOrders = useMemo(
    () =>
      filterStatus === "all"
        ? orders
        : orders.filter((order) => order.status === filterStatus),
    [filterStatus, orders]
  );

  const selectedCoupons = useMemo(
    () => orderCoupons(selectedOrder),
    [selectedOrder]
  );

  return (
    <>
      <Toaster position="top-right" />

      <div className="ash-account-page ash-orders-page">
        <div className="ash-account-shell">
          <aside className="ash-account-side-nav">
            <Link to="/orders" className="active">Orders</Link>
            <Link to="/profile">Profile</Link>
          </aside>

          <main className="ash-orders-main">
            <section className="ash-profile-section ash-orders-section">
              <div className="ash-profile-section-head ash-orders-heading">
                <div>
                  <h2>Đơn hàng của tôi</h2>
                  <p>Theo dõi và quản lý các đơn hàng của bạn</p>
                </div>
                <button type="button" className="ash-outline-btn ash-orders-refresh" onClick={() => fetchOrders({ showToast: true })} disabled={loading}>
                  <FiRefreshCw className={loading ? "spinning" : ""} />
                  {loading ? "Đang tải" : "Làm mới"}
                </button>
              </div>

              <div className="ash-orders-tabs" role="tablist" aria-label="Lọc trạng thái đơn hàng">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`ash-orders-tab ${filterStatus === tab.id ? "active" : ""}`}
                    onClick={() => setFilterStatus(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="ash-profile-card ash-orders-state">Đang tải lịch sử đơn hàng...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="ash-profile-card ash-orders-state">
                  <span className="ash-orders-state-icon"><FiClipboard /></span>
                  <div>
                    <strong>{filterStatus === "all" ? "Bạn chưa có đơn hàng nào" : "Không có đơn hàng ở trạng thái này"}</strong>
                    <p>{filterStatus === "all" ? "Các đơn hàng sau khi đặt sẽ xuất hiện tại đây." : "Bạn có thể chọn trạng thái khác để xem đơn hàng."}</p>
                  </div>
                </div>
              ) : (
                <div className="ash-profile-card ash-orders-card">
                  <div className="ash-orders-table-wrap">
                    <table className="ash-orders-table">
                      <thead>
                        <tr>
                          <th>Mã đơn hàng</th>
                          <th>Ngày đặt</th>
                          <th>Tổng tiền</th>
                          <th>Thanh toán</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td data-label="Mã đơn hàng"><strong className="ash-order-code">#{order.id}</strong></td>
                            <td data-label="Ngày đặt">{formatDate(order.created_at)}</td>
                            <td data-label="Tổng tiền"><strong className="ash-order-price">{formatMoney(order.total_amount)}</strong></td>
                            <td data-label="Thanh toán">
                              <div className="ash-order-payment-cell">
                                <strong>{paymentMethodLabel(order.payment_method)}</strong>
                                <span className={`payment-${order.payment_status || "unpaid"}`}>
                                  {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status || "Chưa xác định"}
                                </span>
                              </div>
                            </td>
                            <td data-label="Trạng thái">
                              <span className={`ash-order-status ${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
                            </td>
                            <td data-label="Thao tác">
                              <div className="ash-order-actions">
                                <button type="button" className="ash-order-action-btn" onClick={() => fetchOrderDetail(order.id)} title="Xem chi tiết">
                                  <FiEye /><span>Xem</span>
                                </button>

                                {order.payment_method === "vnpay" && order.status === "pending" && order.payment_status !== "paid" && (
                                  <button type="button" className="ash-order-action-btn" onClick={() => retryVnpayPayment(order.id)} disabled={payingId === order.id} title="Thanh toán lại bằng VNPay">
                                    <FiCreditCard /><span>{payingId === order.id ? "Đang mở" : "Thanh toán"}</span>
                                  </button>
                                )}

                                {order.status === "pending" && order.payment_status !== "paid" && (
                                  <button type="button" className="ash-order-action-btn danger" onClick={() => setConfirmCancelId(order.id)} disabled={cancelingId === order.id} title="Hủy đơn hàng">
                                    <FiTrash2 /><span>{cancelingId === order.id ? "Đang hủy" : "Hủy"}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <section className="ash-profile-actions ash-orders-account-actions">
              <button type="button" className="ash-outline-btn ash-logout-btn" onClick={handleLogout}>Đăng xuất</button>
            </section>
          </main>
        </div>
      </div>

      {detailOrderId && (
        <div className="ash-order-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeOrderDetail()}>
          <div className="ash-order-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
            <button type="button" className="ash-order-modal-close" onClick={closeOrderDetail} aria-label="Đóng"><FiX /></button>

            {detailLoading ? (
              <div className="ash-order-detail-state">
                <FiRefreshCw className="spinning" />
                <strong>Đang tải chi tiết đơn hàng...</strong>
              </div>
            ) : detailError ? (
              <div className="ash-order-detail-state error">
                <strong>Không thể hiển thị đơn hàng</strong>
                <p>{detailError}</p>
                <button type="button" onClick={() => fetchOrderDetail(detailOrderId)}>Thử lại</button>
              </div>
            ) : selectedOrder ? (
              <>
                <div className="ash-order-modal-header">
                  <div>
                    <span>CHI TIẾT ĐƠN HÀNG</span>
                    <h3 id="order-detail-title">Đơn hàng #{selectedOrder.id}</h3>
                    <p>Đặt lúc {formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <span className={`ash-order-status ${selectedOrder.status}`}>
                    {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>

                <div className="ash-order-info-grid">
                  <section className="ash-order-info-card">
                    <h4><FiMapPin /> Giao hàng</h4>
                    <strong>{selectedOrder.shipping_receiver_name || selectedOrder.address?.receiver_name || "Người nhận"}</strong>
                    <span>{selectedOrder.shipping_phone || selectedOrder.address?.phone || "Không có số điện thoại"}</span>
                    <p>{[
                      selectedOrder.shipping_street || selectedOrder.address?.street,
                      selectedOrder.shipping_ward || selectedOrder.address?.ward,
                      selectedOrder.shipping_district || selectedOrder.address?.district,
                      selectedOrder.shipping_province || selectedOrder.address?.province,
                    ].filter(Boolean).join(", ") || "Không có địa chỉ giao hàng"}</p>
                  </section>

                  <section className="ash-order-info-card">
                    <h4><FiCreditCard /> Thanh toán</h4>
                    <div className="ash-order-payment-row">
                      <strong>{paymentMethodLabel(selectedOrder.payment_method)}</strong>
                      <span className={`payment-${selectedOrder.payment_status || "unpaid"}`}>
                        {PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status || "Chưa xác định"}
                      </span>
                    </div>
                    {selectedOrder.payment_method === "vnpay" ? (
                      <dl className="ash-payment-details">
                        <div><dt>Mã VNPay</dt><dd>{selectedOrder.vnpay_txn_ref || "—"}</dd></div>
                        <div><dt>Mã giao dịch</dt><dd>{selectedOrder.vnpay_transaction_no || "—"}</dd></div>
                        <div><dt>Thanh toán lúc</dt><dd>{formatDate(selectedOrder.paid_at)}</dd></div>
                      </dl>
                    ) : (
                      <p>Thanh toán khi khách nhận được hàng.</p>
                    )}
                  </section>
                </div>

                <section className="ash-order-products-block">
                  <div className="ash-order-block-title">
                    <h4>Sản phẩm đã mua</h4>
                    <span>{selectedOrder.items?.length || 0} sản phẩm</span>
                  </div>
                  <div className="ash-order-items">
                    {selectedOrder.items?.length ? (
                      selectedOrder.items.map((item) => {
                        const snapshot = itemSnapshot(item);
                        return (
                          <div className="ash-order-item" key={item.id || `${item.product_variant_id}-${snapshot.color}-${snapshot.size}`}>
                            <img src={snapshot.image} alt={snapshot.name} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                            <div className="ash-order-item-copy">
                              <strong>{snapshot.name}</strong>
                              {snapshot.sku && <span>SKU: {snapshot.sku}</span>}
                              <span>Màu: {snapshot.color} · Size: {snapshot.size}</span>
                              <span>Số lượng: {item.quantity}</span>
                            </div>
                            <div className="ash-order-item-price-wrap">
                              <span>{formatMoney(item.price)} × {item.quantity}</span>
                              <strong className="ash-order-item-price">{formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</strong>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="ash-order-empty-items">Không có thông tin sản phẩm.</p>
                    )}
                  </div>
                </section>

                <div className="ash-order-footer-grid">
                  <section className="ash-order-note-card">
                    <h4>Ghi chú</h4>
                    <p>{selectedOrder.note || "Khách hàng không để lại ghi chú."}</p>
                  </section>

                  <section className="ash-order-totals-card">
                    <div><span>Tạm tính</span><strong>{formatMoney(selectedOrder.subtotal)}</strong></div>
                    <div><span>Phí vận chuyển</span><strong>{formatMoney(selectedOrder.shipping_fee)}</strong></div>
                    {Number(selectedOrder.discount_amount) > 0 && (
                      <div className="discount"><span>Giảm giá sản phẩm</span><strong>-{formatMoney(selectedOrder.discount_amount)}</strong></div>
                    )}
                    {Number(selectedOrder.shipping_discount) > 0 && (
                      <div className="discount"><span>Giảm phí vận chuyển</span><strong>-{formatMoney(selectedOrder.shipping_discount)}</strong></div>
                    )}
                    <div className="ash-order-vouchers">
                      <span><FiTag /> Voucher</span>
                      {selectedCoupons.length ? (
                        <div>{selectedCoupons.map((coupon) => (
                          <strong key={coupon.id || `${coupon.coupon_kind}-${coupon.code_snapshot}`}>
                            {coupon.code_snapshot}
                          </strong>
                        ))}</div>
                      ) : <em>Không sử dụng</em>}
                    </div>
                    <div className="total"><span>Tổng thanh toán</span><strong>{formatMoney(selectedOrder.total_amount)}</strong></div>
                  </section>
                </div>

                <button type="button" className="ash-order-modal-primary" onClick={closeOrderDetail}>Đóng</button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {confirmCancelId && (
        <div className="ash-order-modal-backdrop">
          <div className="ash-cancel-modal" role="dialog" aria-modal="true">
            <span className="ash-cancel-icon"><FiTrash2 /></span>
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Bạn có chắc muốn hủy đơn hàng <strong>#{confirmCancelId}</strong>? Tồn kho và voucher sẽ được backend hoàn lại.</p>
            <div>
              <button type="button" onClick={() => setConfirmCancelId(null)} disabled={cancelingId !== null}>Không, quay lại</button>
              <button type="button" className="danger" onClick={executeCancelOrder} disabled={cancelingId !== null}>{cancelingId !== null ? "Đang xử lý..." : "Có, hủy đơn"}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
