import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Register from './pages/Register'; // Đường dẫn đến file đăng ký của em

// Import 2 trang lớn từ thư mục pages của em
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        {/* Đường dẫn mặc định khi mở web -> Chạy trang chủ Home */}
        <Route path="/" element={<Home />} />
        
        {/* Đường dẫn khi gõ /login -> Chạy trang đăng nhập Login */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;