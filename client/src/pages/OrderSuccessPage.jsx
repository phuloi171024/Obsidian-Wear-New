import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import "./OrderSuccessPage.css";

const PAYMENT_STATUS_LABELS = {
  paid: "Đã thanh toán",
  pending: "Đang chờ thanh toán",
  unpaid: "Chưa thanh toán",
  failed: "Thanh toán thất bại",
  expired: "Đã hết hạn thanh toán",
  refunded: "Đã hoàn tiền",
};

const wait = (milliseconds, signal) =>
  new Promise((resolve) => {
    const timer = window.setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });

const normalizeOrderId = (value) => {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim().replace(/^#/, "");
  return /^\d+$/.test(normalized) && Number(normalized) > 0
    ? normalized
    : null;
};

const getPaymentStatusLabel = (status) =>
  PAYMENT_STATUS_LABELS[status] || status || "Chưa xác định";

const getPaymentMethodLabel = (method) => {
  if (method === "cod") return "Thanh toán khi nhận hàng (COD)";
  if (method === "vnpay") return "Thanh toán qua VNPay";
  return method || "Chưa xác định";
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `${amount.toLocaleString("vi-VN")} đ`
    : "—";
};

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const latestRequestRef = useRef(0);

  const orderId = useMemo(() => {
    const queryOrderId = normalizeOrderId(searchParams.get("order_id"));
    if (queryOrderId) return queryOrderId;

    // location.state chỉ tồn tại trong lần chuyển trang hiện tại,
    // không đọc orderId cũ từ localStorage hoặc sessionStorage.
    return normalizeOrderId(
      location.state?.order?.id ?? location.state?.order?.code
    );
  }, [location.state, searchParams]);

  const [order, setOrder] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    const controller = new AbortController();
    let cancelled = false;

    const isCurrentRequest = () =>
      !cancelled && latestRequestRef.current === requestId;

    setOrder(null);
    setErrorMessage("");

    if (!orderId) {
      setPageStatus("not_found");
      setErrorMessage("Không có mã đơn hàng hợp lệ để kiểm tra.");
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    const token = localStorage.getItem("access_token")?.trim();

    if (!token) {
      setPageStatus("unauthenticated");
      setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user_info");
      window.dispatchEvent(new Event("loginSuccess"));
      navigate("/login", { replace: true });
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    setPageStatus("loading");

    const verifyOrder = async () => {
      // VNPay có thể cần chờ IPN cập nhật nên thử lại tối đa 15 lần.
      // COD sẽ thoát ngay sau lần API đầu tiên.
      for (let attempt = 0; attempt < 15; attempt += 1) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            }
          );

          let data = {};
          try {
            data = await response.json();
          } catch {
            data = {};
          }

          if (!isCurrentRequest()) return;

          if (response.status === 401) {
            setPageStatus("unauthenticated");
            setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem("access_token");
            localStorage.removeItem("token");
            localStorage.removeItem("user_info");
            window.dispatchEvent(new Event("loginSuccess"));
            navigate("/login", { replace: true });
            return;
          }

          // Backend cố ý trả 404 cho cả đơn không tồn tại và đơn của người khác.
          if (response.status === 403 || response.status === 404) {
            setPageStatus("not_found");
            setErrorMessage(
              "Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này."
            );
            return;
          }

          if (!response.ok || data.status === false) {
            setPageStatus("error");
            setErrorMessage(
              data.message || "Không thể tải thông tin đơn hàng."
            );
            return;
          }

          const verifiedOrder = data.order || data.data || data;

          if (!verifiedOrder?.id) {
            setPageStatus("not_found");
            setErrorMessage("Dữ liệu đơn hàng trả về không hợp lệ.");
            return;
          }

          setOrder(verifiedOrder);

          if (verifiedOrder.payment_method !== "vnpay") {
            setPageStatus("success");
            return;
          }

          if (verifiedOrder.payment_status === "paid") {
            setPageStatus("success");
            return;
          }

          if (
            verifiedOrder.status === "cancelled" ||
            ["failed", "expired"].includes(verifiedOrder.payment_status)
          ) {
            setPageStatus("payment_failed");
            return;
          }

          if (attempt < 14) {
            await wait(2000, controller.signal);
            if (!isCurrentRequest()) return;
          }
        } catch (error) {
          if (error.name === "AbortError" || !isCurrentRequest()) return;

          setPageStatus("error");
          setErrorMessage(
            "Không kết nối được máy chủ. Vui lòng kiểm tra lại kết nối."
          );
          return;
        }
      }

      if (isCurrentRequest()) setPageStatus("payment_pending");
    };

    verifyOrder();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [navigate, orderId]);

  const isLoading = pageStatus === "loading";
  const isSuccess = pageStatus === "success" && Boolean(order);
  const isPending = pageStatus === "payment_pending" && Boolean(order);
  const isPaymentFailed = pageStatus === "payment_failed" && Boolean(order);
  const isError = !isLoading && !isSuccess && !isPending && !isPaymentFailed;

  const title = isSuccess
    ? order.payment_method === "vnpay"
      ? "Thanh toán thành công!"
      : "Đặt hàng thành công!"
    : isPending
      ? "Đang xác nhận thanh toán"
      : isPaymentFailed
        ? "Thanh toán chưa thành công"
        : "Không thể hiển thị đơn hàng";

  const description = isSuccess
    ? order.payment_method === "vnpay"
      ? "Đơn hàng đã được VNPay xác nhận thanh toán."
      : "Đơn COD đã được tạo và đang chờ cửa hàng xác nhận."
    : isPending
      ? "Hệ thống chưa nhận được xác nhận cuối cùng từ VNPay. Bạn có thể kiểm tra lại trong lịch sử đơn hàng."
      : isPaymentFailed
        ? "Giao dịch chưa được ghi nhận thành công. Bạn có thể thanh toán lại trong lịch sử đơn hàng."
        : errorMessage;

  const iconWrapperClass = isSuccess
    ? "bg-green-100"
    : isPending
      ? "bg-amber-100"
      : "bg-red-100";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <main className="grow max-w-2xl w-full mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${iconWrapperClass}`}
        >
          {isSuccess ? (
            <FaCheckCircle className="text-green-600 text-5xl" />
          ) : isPending || isLoading ? (
            <FaClock className="text-amber-600 text-5xl" />
          ) : (
            <FaExclamationTriangle className="text-red-600 text-5xl" />
          )}
        </div>

        {isLoading ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đang kiểm tra đơn hàng
            </h1>
            <p className="text-gray-500 text-sm">
              Vui lòng chờ trong giây lát...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-500 text-sm mb-8">{description}</p>

            {(isSuccess || isPending || isPaymentFailed) && order && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full text-left space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-semibold text-gray-900">
                    #{order.id}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">Phương thức thanh toán</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {getPaymentMethodLabel(order.payment_method)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">Trạng thái thanh toán</span>
                  <span
                    className={`font-semibold text-right ${
                      order.payment_status === "paid"
                        ? "text-green-700"
                        : ["failed", "expired"].includes(order.payment_status)
                          ? "text-red-700"
                          : "text-amber-700"
                    }`}
                  >
                    {getPaymentStatusLabel(order.payment_status)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm pt-3 border-t border-gray-100">
                  <span className="text-gray-700 font-semibold">Tổng cộng</span>
                  <span className="text-indigo-600 font-bold text-base">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            )}

            {isError && (
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 w-full">
                <p className="text-red-700 text-sm m-0">
                  {errorMessage || "Không thể xác minh đơn hàng."}
                </p>
                {orderId && (
                  <p className="text-gray-400 text-xs mt-3 mb-0">
                    Mã được yêu cầu: #{orderId}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {!isLoading && (
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
            <Link
              to={pageStatus === "unauthenticated" ? "/login" : "/orders"}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-colors"
            >
              {pageStatus === "unauthenticated"
                ? "Đăng nhập lại"
                : "Quay lại đơn hàng"}
            </Link>

            <Link
              to="/products"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 px-4 rounded-xl text-center transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
