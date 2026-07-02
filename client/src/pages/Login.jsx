import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate(); // Hook dùng để chuyển hướng trang
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dữ liệu đăng nhập:', formData);

    // Hiển thị thông báo đăng nhập thành công
    alert('Đăng nhập thành công!');

    // Chuyển hướng ngay lập tức sang trang chủ (đường dẫn '/')
    navigate('/');
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

        <h2 className="text-2xl font-bold mb-8 text-neutral-800">Đăng nhập</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <input type="email" name="email" placeholder="email@của bạn.com" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-neutral-700">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="........" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
            <label htmlFor="rememberMe" className="text-xs text-neutral-600">Ghi nhớ đăng nhập</label>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition duration-200 shadow-sm">Đăng nhập</button>
        </form>

        <p className="text-xs text-neutral-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;