import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import "./OrderSuccessPage.css";

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export default function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateOrder = location.state?.order;
  const orderId = searchParams.get("order_id") || stateOrder?.code;
  const isVnpay = searchParams.get("payment") === "vnpay";

  const [order, setOrder] = useState(null);
  const [verification, setVerification] = useState(
    isVnpay ? "checking" : "ordered"
  );

  useEffect(() => {
    if (!isVnpay || !orderId) {
      if (stateOrder) {
        setOrder({
          id: stateOrder.code,
          total_amount: stateOrder.rawTotal ?? stateOrder.total,
          payment_method: "cod",
          payment_status: "unpaid",
        });
      }
      return undefined;
    }

    let cancelled = false;

    const verifyPayment = async () => {
      const token = localStorage.getItem("access_token");

      for (let attempt = 0; attempt < 15 && !cancelled; attempt += 1) {
        try {
          const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (response.ok) {
            const currentOrder = data.order || data;
            setOrder(currentOrder);

            if (currentOrder.payment_status === "paid") {
              setVerification("paid");
              return;
            }

            if (
              currentOrder.status === "cancelled" ||
              ["failed", "expired"].includes(currentOrder.payment_status)
            ) {
              setVerification("failed");
              return;
            }
          }
        } catch (error) {
          console.error("Không thể xác minh trạng thái VNPay:", error);
        }

        await wait(2000);
      }

      if (!cancelled) {
        setVerification("pending");
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [isVnpay, orderId, stateOrder]);

  const isPaid = verification === "paid";
  const isFailed = verification === "failed";
  const isSuccessful = !isVnpay || isPaid;
  const title = !isVnpay
    ? "Đặt hàng thành công!"
    : isPaid
    ? "Thanh toán thành công!"
    : isFailed
    ? "Thanh toán chưa thành công"
    : "Đang xác nhận thanh toán";
  const description = !isVnpay
    ? "Đơn COD đã được tạo và đang chờ cửa hàng xác nhận."
    : isPaid
    ? "Backend đã nhận IPN và xác nhận đơn hàng đã thanh toán."
    : isFailed
    ? "Đơn hàng chưa được ghi nhận thanh toán. Bạn có thể thanh toán lại trong lịch sử đơn hàng."
    : "VNPay đã chuyển bạn về cửa hàng. Hệ thống đang chờ IPN xác nhận từ máy chủ VNPay.";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <main className="grow max-w-2xl w-full mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isSuccessful ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-amber-100"}`}>
          {isSuccessful ? (
            <FaCheckCircle className="text-green-600 text-5xl" />
          ) : isFailed ? (
            <FaExclamationTriangle className="text-red-600 text-5xl" />
          ) : (
            <FaClock className="text-amber-600 text-5xl" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm mb-8">{description}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Mã đơn hàng</span>
            <span className="font-semibold text-gray-900">#{order?.id || orderId || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phương thức thanh toán</span>
            <span className="font-semibold text-gray-900">{isVnpay ? "VNPay" : "COD"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Trạng thái thanh toán</span>
            <span className="font-semibold text-gray-900">{order?.payment_status || verification}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
            <span className="text-gray-700 font-semibold">Tổng cộng</span>
            <span className="text-indigo-600 font-bold text-base">
              {order?.total_amount != null
                ? `${Number(order.total_amount).toLocaleString("vi-VN")} đ`
                : "Đang tải..."}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
          <Link to="/orders" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-colors">
            Xem đơn hàng
          </Link>
          <Link to="/products" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 px-4 rounded-xl text-center transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    </div>
  );
}
