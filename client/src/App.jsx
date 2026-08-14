import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header'; // Chú ý: import ở App.jsx chỉ là ./

// Import các trang Client & Tài khoản
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
import Contact from "./pages/Contact/Contact";
import SizeGuide from "./pages/SizeGuide";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import ShippingInfoPage from "./pages/ShippingInfoPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";

// Import các trang Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Orders from "./pages/Admin/Orders";
import Products from "./pages/Admin/Products";
import Categories from "./pages/Admin/Categories";
import Users from "./pages/Admin/Users";
import Statistics from "./pages/Admin/Statistics";
import Comments from "./pages/Admin/Comments";
import Variants from "./pages/Admin/Variants";
import DiscountCodes from "./pages/Admin/DiscountCodes";

// ==========================================
// 1. TRẠM KIỂM SOÁT BẢO MẬT (ROUTE GUARDS)
// ==========================================

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("access_token");
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("access_token");
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ==========================================
// 2. ẨN HEADER Ở TRANG ADMIN
// ==========================================

function ConditionalHeader() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return null;
  return <Header />;
}

function App() {
  return (
    <BrowserRouter>
      <ConditionalHeader />

      <Routes>
        {/* NHÓM 1: PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products/ao" element={<AoPage />} />
        <Route path="/products/giay" element={<GiayPage />} />
        <Route path="/products/pants" element={<QuanPage />} />
        <Route path="/products/phu-kien" element={<TuiPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/size-guide" element={<SizeGuide />} />

        {/* NHÓM 2: GUEST ONLY */}
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        {/* NHÓM 3: PRIVATE - Bắt buộc PHẢI ĐĂNG NHẬP */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/shipping-info" element={<ProtectedRoute><ShippingInfoPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

        {/* NHÓM 4: ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="comments" element={<Comments />} />
          <Route path="products/variants" element={<Variants />} />
          <Route path="discount-codes" element={<DiscountCodes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;