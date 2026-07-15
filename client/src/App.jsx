import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; 
import Home from "./pages/Home"; 
import ProductPage from "./pages/ProductPage"; 
import PantsPage from "./pages/PantsPage";
import AoPage from "./pages/AoPage";
import TuiPage from "./pages/TuiPage";
import GiayPage from "./pages/GiayPage";
import Login from './pages/Login';
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import ShippingInfoPage from "./pages/ShippingInfoPage";
import ForgotPassword from "./pages/ForgotPassword";
import OrderSuccessPage from "./pages/OrderSuccessPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/pants" element={<PantsPage />} />
        <Route path="/products/ao" element={<AoPage />} />
        <Route path="/products/tui" element={<TuiPage />} />
        <Route path="/products/giay" element={<GiayPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/ShippingInfoPage" element={<ShippingInfoPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />

        {/* Đường dẫn khi gõ /login -> Chạy trang đăng nhập Login */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;