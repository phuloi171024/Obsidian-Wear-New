import React, { useState } from 'react';

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState('cod');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      
      {/* ================= HEADER SECTION ================= */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center select-none cursor-pointer h-12">
            <img 
              src="/logo.png" 
              alt="Obsidian Wear Logo" 
              className="h-full w-auto object-contain object-left" 
            />
          </div>

          {/* Navigation Menu - Y chang ảnh mẫu: Chữ siêu đậm, đen tuyền, uppercase */}
          <nav className="hidden md:flex items-center space-x-12">
            <a href="#" className="font-black text-sm tracking-wider text-black uppercase hover:opacity-70 transition-opacity">Trang chủ</a>
            <a href="#" className="font-black text-sm tracking-wider text-black uppercase hover:opacity-70 transition-opacity">Quần</a>
            <a href="#" className="font-black text-sm tracking-wider text-black uppercase hover:opacity-70 transition-opacity">Áo</a>
            <a href="#" className="font-black text-sm tracking-wider text-black uppercase hover:opacity-70 transition-opacity">Túi</a>
            <a href="#" className="font-black text-sm tracking-wider text-black uppercase hover:opacity-70 transition-opacity">Giày</a>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-6">
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="Bạn đang tìm kiếm gì ?" 
                className="w-56 bg-white text-xs pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-black transition-colors"
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* User Icon */}
            <button className="text-gray-800 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
            
            {/* Shopping Cart Icon - Cập nhật đúng loại giỏ hàng như hình */}
            <button className="text-gray-800 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-0 2.1-1.002 2.349-2.109l1.593-7.143c.106-.481-.26-.943-.754-.943H5.304m0 0l1.39 5.251" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT SECTION ================= */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
          
          {/* Tabs Thanh toán */}
          <div className="flex border-b border-gray-200 mb-8">
            <button 
              onClick={() => setActiveTab('cod')}
              className={`flex items-center space-x-2 pb-3 px-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'cod' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <span>$ Tiền mặt khi nhận hàng</span>
            </button>
            <button 
              onClick={() => setActiveTab('sepay')}
              className={`flex items-center space-x-2 pb-3 px-6 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'sepay' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <span>💳 Sepay</span>
            </button>
          </div>

          {/* Chi tiết phương thức COD */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-lg font-bold text-gray-900">
              <span>$</span>
              <h3>Thanh toán khi nhận hàng (COD)</h3>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="space-y-2.5 text-sm">
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Mã đơn hàng:</span> ORD21751592</p>
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Tổng tiền cần thanh toán:</span> <span className="text-red-500 font-bold text-base">1.920.000 đ</span></p>
              <p className="text-gray-600"><span className="font-semibold text-gray-800">Phương thức:</span> Thanh toán khi nhận hàng</p>
            </div>

            {/* Khối lưu ý quan trọng */}
            <div className="bg-amber-50/60 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs text-amber-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900 mb-1">
                <span>⚠️ Lưu ý quan trọng:</span>
              </div>
              <p>• Vui lòng chuẩn bị đúng số tiền khi nhận hàng</p>
              <p>• Kiểm tra kỹ sản phẩm trước khi thanh toán</p>
              <p>• Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc</p>
              <p>• Phí giao hàng đã được tính trong tổng số tiền</p>
            </div>

            {/* Khối quy trình giao hàng */}
            <div className="bg-blue-50/60 border-l-4 border-blue-500 rounded-r-xl p-4 text-xs text-blue-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-blue-900 mb-1">
                <span>ℹ️ Quy trình giao hàng COD:</span>
              </div>
              <p>1. Nhân viên giao hàng sẽ liên hệ trước khi giao</p>
              <p>2. Bạn kiểm tra sản phẩm khi nhận hàng</p>
              <p>3. Thanh toán trực tiếp cho nhân viên giao hàng</p>
              <p>4. Nhận biên lai xác nhận thanh toán</p>
            </div>

            {/* Nút hành động */}
            <div className="pt-4 space-y-3">
              <button className="w-full bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm">
                <span>✓ Xác nhận thanh toán COD</span>
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-3 px-4 rounded-xl transition-colors">
                Quay lại chi tiết đơn hàng
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ================= FOOTER SECTION ================= */}
      {/* Sao chép chuẩn xác cấu trúc 4 cột lặp tiêu đề và khối cổng thanh toán bên góc trái */}
      <footer className="bg-[#ffffff] border-t border-gray-100 pt-14 pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          
          {/* Cột 1: Giới thiệu & Mạng xã hội */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-normal text-black">Về Obsidian Wear</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Obsidian Wear cung cảp các sản phẩm quần áo thể thao chất lượng cao với nhiều phong cách đa dạng cho nam, nữ và trẻ em.
            </p>
            
            {/* Khối Icon Mạng xã hội chuẩn màu sắc nhận diện */}
            <div className="flex items-center space-x-2 pt-1">
              {/* Facebook */}
              <a href="#" className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold hover:opacity-85 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2c4.477 2 10 2 10c4.991 0 9.103 3.657 9.875 8.438v-8.438H17v2.219h1.438c.313 0 .563.25.563.563v2.813H17V22h-3v-6.188h-2.188V13H14v-2.313c0-2.156 1.313-3.344 3.25-3.344.938 0 1.938.156 1.938.156v2.125H18.06c-1.063 0-1.375.656-1.375 1.344V13h2.406l-.375 2.813H16.69V22c5.523 0 10-4.477 10-10z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-7 h-7 rounded-full bg-[#E4405F] flex items-center justify-center text-white hover:opacity-85 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* Twitter */}
              <a href="#" className="w-7 h-7 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-85 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" className="w-7 h-7 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-85 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Cột 2: Sản phẩm */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-normal text-black">Về Obsidian Wear</h4>
            <ul className="space-y-2.5 text-xs text-gray-500 font-semibold">
              <li><a href="#" className="hover:text-black transition-colors">Sản phẩm</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Áo nam</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Áo nữ</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Áo trẻ em</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Khuyến mãi</a></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-normal text-black">Về Obsidian Wear</h4>
            <ul className="space-y-2.5 text-xs text-gray-500 font-semibold">
              <li><a href="#" className="hover:text-black transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Chính sách vận chuyển</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Hướng dẫn chọn size</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-normal text-black">Về Obsidian Wear</h4>
            <ul className="space-y-3.5 text-xs text-gray-500 font-semibold">
              <li className="flex items-start space-x-2.5">
                <span className="text-[#3b82f6] text-sm leading-none">⚙️</span>
                <span className="leading-relaxed">123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="text-[#3b82f6] text-sm leading-none">📞</span>
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="text-[#3b82f6] text-sm leading-none">✉️</span>
                <span>Hello@obsidianwear.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Khối Đáy: Thanh toán bên Trái & Bản quyền ở Giữa như sơ đồ ảnh mẫu */}
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-100 flex flex-col space-y-4">
          <div className="space-y-2">
            <h5 className="text-[11px] font-black tracking-normal text-black uppercase">Phương Thức Thanh Toán</h5>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded text-[10px] font-black text-[#1A1F71] shadow-xs select-none">VISA</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded text-[10px] font-black text-[#FF5F00] shadow-xs select-none">mastercard</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded text-[10px] font-black text-[#0066B2] shadow-xs select-none">JCB</span>
              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-[#E02020] font-serif italic shadow-xs select-none">VNPAY</span>
              <span className="px-2 py-0.5 bg-[#A50064] border border-[#A50064] rounded text-[9px] font-bold text-white shadow-xs select-none">mo mo</span>
            </div>
          </div>
          
          {/* Copyright căn giữa chuẩn xác */}
          <div className="text-center text-[11px] text-gray-500 font-medium pt-2">
            © 2026 OBSIDIAN WEAR. All rights reserved
          </div>
        </div>
      </footer>

    </div>
  );
}