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
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6 select-none">
          <div className="flex items-center space-x-2 text-xs font-serif tracking-widest text-neutral-800">
            <span>EST</span>
            <svg className="w-8 h-8 my-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2v20M2 12h20M5.64 5.64l12.72 12.72M5.64 19.36L18.36 5.64" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span>2026</span>
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase font-mono italic mt-1 text-black">Obsidian Wear</h1>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-neutral-800">Quên mật khẩu?</h2>
        <p className="text-xs text-neutral-500 text-center mb-8 max-w-sm leading-relaxed">
          Vui lòng nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã xác nhận hoặc liên kết để bạn thiết lập lại mật khẩu mới.
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700 block">E-mail của bạn</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input type="email" placeholder="email@của bạn.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black" />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition duration-200 shadow-sm">Gửi yêu cầu</button>
          </form>
        ) : (
          <div className="w-full text-center p-4 bg-green-50 border border-green-200 rounded-md mb-4">
            <p className="text-sm text-green-700 font-medium">Kiểm tra hộp thư! Một liên kết đặt lại mật khẩu đã được gửi đến hộp thư số của bạn.</p>
          </div>
        )}

        <p className="text-xs text-neutral-500 mt-6">
          <Link to="/login" className="text-blue-600 font-semibold hover:underline flex items-center space-x-1">
            <span>← Quay lại Đăng nhập</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;