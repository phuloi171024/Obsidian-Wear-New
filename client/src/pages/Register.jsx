import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate(); // Hook dùng để chuyển trang
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra hai mật khẩu có khớp nhau không
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    console.log('Dữ liệu đăng ký:', formData);
    
    // Hiển thị thông báo đăng ký thành công
    alert('Đăng ký thành công!');
    
    // Chuyển hướng ngay lập tức sang trang đăng nhập
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-xl rounded-lg shadow-xl p-8 md:p-12 flex flex-col items-center">
        
        {/* CỤM LOGO OBSIDIAN WEAR CHUẨN ĐỒNG BỘ */}
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
          
          {/* Tên thương hiệu */}
          <h1 className="text-3xl font-black tracking-wide uppercase font-sans italic mt-1 text-black text-center w-full">
            OBSIDIAN WEAR
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-neutral-800">Đăng ký tài khoản</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">Họ và tên</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input type="text" name="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <input type="email" name="email" placeholder="email@của bạn.com" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">Số điện thoại (tùy chọn)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </span>
              <input type="tel" name="phone" placeholder="0123456789" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="........" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700 block">Xác nhận mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="........" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-800 bg-white text-black" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <input type="checkbox" id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required className="mt-1 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-800 h-4 w-4" />
            <label htmlFor="agreeTerms" className="text-xs text-neutral-600 leading-tight select-none">
              Tôi đồng ý với <a href="#" className="text-black font-semibold hover:underline">Điều khoản</a> và <a href="#" className="text-black font-semibold hover:underline">Chính sách bảo mật</a> của OBSIDIAN WEAR
            </label>
          </div>

          <button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-md transition duration-200 shadow-sm uppercase tracking-wider text-sm">
            Đăng ký
          </button>
        </form>

        <p className="text-xs text-neutral-500 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-black font-bold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
