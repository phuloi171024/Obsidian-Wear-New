import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Register from './pages/Register'; 
import Home from "./pages/Home"; 
import ProductPage from "./pages/ProductPage"; 
import ProductDetail from "./pages/ProductDetail"; // Thêm dòng này
import Login from './pages/Login';
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Header /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        
        {/* Đây là route quan trọng vừa được thêm vào cho trang Chi tiết sản phẩm */}
        <Route path="/product/:id" element={<ProductDetail />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;