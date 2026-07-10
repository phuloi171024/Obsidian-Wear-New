import { useState } from "react";
import {
  FaDollarSign,
  FaRegCreditCard,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import Footer from "../components/Footer";

export default function PaymentPage() {
  const [method, setMethod] = useState("cod"); // "cod" | "sepay"

  const order = {
    code: "ORD21751592",
    total: "1.920.000",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-3xl mx-auto mt-10 mb-16 px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Phương thức thanh toán
            </h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setMethod("cod")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  method === "cod"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaDollarSign />
                Tiền mặt khi nhận hàng
              </button>
              <button
                onClick={() => setMethod("sepay")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  method === "sepay"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaRegCreditCard />
                Sepay
              </button>
            </div>

            {/* COD panel */}
            {method === "cod" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaDollarSign className="text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Thanh toán khi nhận hàng (COD)
                  </h2>
                </div>

                <div className="space-y-2 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mã đơn hàng:</span>
                    <span className="font-medium text-gray-900">{order.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tổng tiền cần thanh toán:</span>
                    <span className="font-bold text-red-600">{order.total} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phương thức:</span>
                    <span className="font-medium text-gray-900">
                      Thanh toán khi nhận hàng
                    </span>
                  </div>
                </div>

                {/* Warning box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-800 font-semibold text-sm mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-amber-500" />
                    Lưu ý quan trọng:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>Vui lòng chuẩn bị đúng số tiền khi nhận hàng</li>
                    <li>Kiểm tra kỹ sản phẩm trước khi thanh toán</li>
                    <li>Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc</li>
                    <li>Phí giao hàng đã được tính trong tổng số tiền</li>
                  </ul>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 font-semibold text-sm mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" />
                    Quy trình giao hàng COD:
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Nhân viên giao hàng sẽ liên hệ trước khi giao</li>
                    <li>Bạn kiểm tra sản phẩm khi nhận hàng</li>
                    <li>Thanh toán trực tiếp cho nhân viên giao hàng</li>
                    <li>Nhận biên lai xác nhận thanh toán</li>
                  </ol>
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition mb-3">
                  <FaCheck />
                  Xác nhận thanh toán COD
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition">
                  Quay lại chi tiết đơn hàng
                </button>
              </div>
            )}

            {/* Sepay panel (placeholder) */}
            {method === "sepay" && (
              <div className="text-center py-12 text-gray-500">
                Thanh toán qua Sepay đang được phát triển.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}