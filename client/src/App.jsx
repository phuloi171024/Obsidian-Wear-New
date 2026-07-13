import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; 
import Home from "./pages/Home"; 
import ProductPage from "./pages/ProductPage"; 
import Login from './pages/Login';
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import ShippingInfoPage from "./pages/ShippingInfoPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/ShippingInfoPage" element={<ShippingInfoPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Đường dẫn khi gõ /login -> Chạy trang đăng nhập Login */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;