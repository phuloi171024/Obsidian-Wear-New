import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email yêu cầu cấp lại mật khẩu:', email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-xl rounded-lg shadow-xl p-8 md:p-12 flex flex-col items-center">
        
        {/* CỤM LOGO OBSIDIAN WEAR CHUẨN ĐỒNG BỘ */}
        <div className="flex flex-col items-center mb-8 select-none w-full max-w-sm">
          <div className="flex items-center justify-center w-full relative">
            {/* Chữ EST bên trái - Dùng font chữ Sans nghiêng đậm chuẩn Streetwear */}
            <span className="text-xl font-black font-sans italic tracking-wider text-black absolute left-4 md:left-8">
              EST
            </span>
            
            {/* Biểu tượng Ngôi sao tỏa sáng (Spike Starburst) chính giữa */}
            <svg className="w-32 h-32 text-black" viewBox="0 0 100 100" fill="currentColor">
              {/* Tâm ngôi sao phối hiệu ứng 3D đổ bóng */}
              <polygon points="50,15 52,48 50,50 48,48" fill="#111" />
              <polygon points="50,85 52,52 50,50 48,52" fill="#444" />
              <polygon points="15,50 48,48 50,50 48,52" fill="#222" />
              <polygon points="85,50 52,48 50,50 52,52" fill="#555" />
              
              <polygon points="25,25 49,47 50,50 47,49" fill="#111" />
              <polygon points="75,75 51,53 50,50 53,51" fill="#444" />
              <polygon points="25,75 47,51 50,50 49,53" fill="#222" />
              <polygon points="75,25 53,49 50,50 51,47" fill="#555" />

              {/* Các tia sáng phụ xung quanh */}
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15) * Math.PI / 180;
                const length = i % 2 === 0 ? 38 : 32;
                const x2 = 50 + length * Math.cos(angle);
                const y2 = 50 + length * Math.sin(angle);
                return (
                  <line 
                    key={i} 
                    x1="50" 
                    y1="50" 
                    x2={x2} 
                    y2={y2} 
                    stroke="black" 
                    strokeWidth="0.6" 
                  />
                );
              })}
            </svg>
            
            {/* Chữ 2026 bên phải */}
            <span className="text-xl font-black font-sans italic tracking-wider text-black absolute right-4 md:right-8">
              2026
            </span>
          </div>
          
          {/* Tên thương hiệu - Đồng bộ kích thước font và kiểu chữ viết hoa nghiêng */}
          <h1 className="text-3xl font-black tracking-wide uppercase font-sans italic mt-1 text-black text-center w-full">
            OBSIDIAN WEAR
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-neutral-800">Quên mật khẩu?</h2>
        <p className="text-xs text-neutral-500 text-center mb-8 max-w-sm leading-relaxed">
          Vui lòng nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết để bạn thiết lập lại mật khẩu mới.
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700 block">E-mail của bạn</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  type="email" 
                  placeholder="email@của bạn.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" 
                />
              </div>
            </div>

            {/* Nút bấm chuyển sang màu đen nguyên bản phối tone thương hiệu */}
            <button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-md transition duration-200 shadow-sm uppercase tracking-wider text-sm">
              Gửi yêu cầu
            </button>
          </form>
        ) : (
          <div className="w-full text-center p-4 bg-neutral-50 border border-neutral-200 rounded-md mb-4">
            <p className="text-sm text-neutral-800 font-medium">
              Kiểm tra hộp thư! Một liên kết đặt lại mật khẩu đã được gửi đến hộp thư của bạn.
            </p>
          </div>
        )}

        <p className="text-xs text-neutral-500 mt-6">
          <Link to="/login" className="text-black font-bold hover:underline flex items-center space-x-1">
            <span>← Quay lại Đăng nhập</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
