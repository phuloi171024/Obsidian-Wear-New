import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';

export default function OrderSuccessPage() {
  const order = {
    code: 'ORD21751592',
    total: '1.920.000',
    method: 'Thanh toán khi nhận hàng (COD)',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <FaCheckCircle className="text-green-600 text-5xl" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Cảm ơn bạn đã mua sắm tại Obsidian Wear. Đơn hàng của bạn đang được xử lý.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Mã đơn hàng</span>
            <span className="font-semibold text-gray-900">{order.code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phương thức thanh toán</span>
            <span className="font-semibold text-gray-900">{order.method}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
            <span className="text-gray-700 font-semibold">Tổng cộng</span>
            <span className="text-indigo-600 font-bold text-base">{order.total} đ</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
          <Link
            to="/products"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            to="/"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 px-4 rounded-xl text-center transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}