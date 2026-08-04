import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';

// Import các trang
import Home from "./pages/Home"; 
import ProductPage from "./pages/ProductPage"; 
import ProductDetail from "./pages/ProductDetail";
import AoPage from "./pages/AoPage";
import GiayPage from "./pages/GiayPage"; 
import QuanPage from "./pages/QuanPage"; 
import TuiPage from "./pages/TuiPage";   
import Register from './pages/Register'; 
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage";
import Contact from "./pages/Contact/Contact";
import SizeGuide from "./pages/SizeGuide";

// ==========================================
// 1. TRẠM KIỂM SOÁT BẢO MẬT (ROUTE GUARDS)
// ==========================================

// Trạm 1: Dành cho trang BẮT BUỘC ĐĂNG NHẬP (Private)
const ProtectedRoute = ({ children }) => {
  // Kiểm tra xem user đã có token trong LocalStorage chưa
  const isAuthenticated = localStorage.getItem("token"); 
  
  if (!isAuthenticated) {
    // Chưa đăng nhập? Đá về trang login ngay lập tức
    return <Navigate to="/login" replace />;
  }
  return children; // Đã đăng nhập? Cho phép vào trong
};

// Trạm 2: Dành cho trang CHỈ DÀNH CHO KHÁCH (Guest)
const GuestRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token"); 
  
  if (isAuthenticated) {
    // Đã đăng nhập rồi mà còn vào trang Login/Register? Đá về trang chủ
    return <Navigate to="/" replace />;
  }
  return children;
};

// ==========================================
// 2. CẤU HÌNH ĐƯỜNG DẪN CHÍNH
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <Header /> 
      
      <Routes>
        {/* NHÓM 1: PUBLIC - Ai cũng vào được (Không cần kiểm tra) */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products/ao" element={<AoPage />} />
        <Route path="/products/giay" element={<GiayPage />} />
        <Route path="/products/pants" element={<QuanPage />} /> 
        <Route path="/products/phu-kien" element={<TuiPage />} /> 
        <Route path="/contact" element={<Contact />} />
        <Route path="/size-guide" element={<SizeGuide />} />

        {/* NHÓM 2: GUEST ONLY - Phải CHƯA ĐĂNG NHẬP mới được vào */}
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        {/* NHÓM 3: PRIVATE - Bắt buộc PHẢI ĐĂNG NHẬP mới được vào */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;