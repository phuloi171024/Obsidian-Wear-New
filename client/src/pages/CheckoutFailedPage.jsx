import { Link, useSearchParams } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaReceipt } from "react-icons/fa";

const FAILURE_MESSAGES = {
  "07": "Giao dịch bị nghi ngờ gian lận.",
  "09": "Thẻ hoặc tài khoản chưa đăng ký dịch vụ Internet Banking.",
  "10": "Bạn đã nhập sai thông tin xác thực quá số lần cho phép.",
  "11": "Giao dịch đã hết thời gian thanh toán.",
  "12": "Thẻ hoặc tài khoản đang bị khóa.",
  "13": "Mã xác thực OTP không chính xác.",
  "24": "Bạn đã hủy giao dịch thanh toán.",
  "51": "Tài khoản không đủ số dư để thanh toán.",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Bạn đã nhập sai mật khẩu thanh toán quá số lần cho phép.",
  invalid_signature: "Không thể xác minh chữ ký phản hồi từ VNPay.",
  system_error: "Hệ thống gặp lỗi khi xử lý kết quả thanh toán.",
  unknown: "VNPay chưa xác nhận giao dịch thành công.",
};

export default function CheckoutFailedPage() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");
  const reason =
    searchParams.get("reason") ||
    searchParams.get("vnp_ResponseCode") ||
    "unknown";

  const message = FAILURE_MESSAGES[reason] || FAILURE_MESSAGES.unknown;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <main className="grow w-full max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <FaExclamationTriangle className="text-red-600 text-5xl" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán chưa thành công
        </h1>

        <p className="text-gray-500 text-sm mb-8 max-w-lg">
          {message} Bạn chưa bị ghi nhận thanh toán thành công. Vui lòng kiểm
          tra lại đơn hàng trước khi thực hiện thao tác tiếp theo.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full text-left space-y-3">
          {orderId && (
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-semibold text-gray-900">#{orderId}</span>
            </div>
          )}

          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500">Phương thức</span>
            <span className="font-semibold text-gray-900">VNPay</span>
          </div>

          <div className="flex justify-between gap-4 text-sm pt-3 border-t border-gray-100">
            <span className="text-gray-500">Trạng thái</span>
            <span className="font-semibold text-red-600">
              Chưa thanh toán
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <FaReceipt />
            Xem đơn hàng
          </Link>

          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <FaHome />
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}