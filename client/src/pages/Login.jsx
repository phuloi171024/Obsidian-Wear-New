import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dữ liệu đăng nhập:', formData);
    alert('Đăng nhập thành công!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-xl rounded-lg shadow-xl p-8 md:p-12 flex flex-col items-center">
        
        {/* CỤM LOGO OBSIDIAN WEAR ĐÃ ĐƯỢC THAY THẾ CHÍNH XÁC THEO ẢNH */}
        <div className="flex flex-col items-center mb-8 select-none w-full max-w-sm">
          <div className="flex items-center justify-center w-full relative">
            {/* Chữ EST bên trái */}
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

              {/* Các tia sáng phụ xung quanh (Mô phỏng hiệu ứng tỏa sáng của ảnh gốc) */}
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
          
          {/* Tên thương hiệu viền dày, font chữ Sans/Mono nghiêng đậm chất Streetwear */}
          <h1 className="text-3xl font-black tracking-wide uppercase font-sans italic mt-1 text-black text-center w-full">
            OBSIDIAN WEAR
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-neutral-800">Đăng nhập</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input type="email" name="email" placeholder="email@của bạn.com" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-neutral-700">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs text-neutral-600 hover:underline font-medium">Quên mật khẩu?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="........" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-800 h-4 w-4" />
            <label htmlFor="rememberMe" className="text-xs text-neutral-600 select-none">Ghi nhớ đăng nhập</label>
          </div>

          {/* Đổi nút bấm sang màu đen hợp tone màu Obsidian */}
          <button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-md transition duration-200 shadow-sm uppercase tracking-wider text-sm">
            Đăng nhập
          </button>
        </form>

        <p className="text-xs text-neutral-500 mt-6">
          Chưa có tài khoản?{' '}
          {/* ĐÃ SỬA: Đường dẫn to="/" cũ đổi thành to="/register" */}
          <Link to="/register" className="text-black font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
