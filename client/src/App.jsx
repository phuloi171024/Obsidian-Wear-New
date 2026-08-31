import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import { QuickAddProvider } from "./components/QuickAddProvider";

// Import các trang Client & tài khoản
import Home from "./pages/Home";
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const AoPage = lazy(() => import("./pages/AoPage"));
const GiayPage = lazy(() => import("./pages/GiayPage"));
const QuanPage = lazy(() => import("./pages/QuanPage"));
const TuiPage = lazy(() => import("./pages/TuiPage"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ShippingInfoPage = lazy(() => import("./pages/ShippingInfoPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const CheckoutFailedPage = lazy(() => import("./pages/CheckoutFailedPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const Orders = lazy(() => import("./pages/Admin/Orders"));
const Products = lazy(() => import("./pages/Admin/Products"));
const Categories = lazy(() => import("./pages/Admin/Categories"));
const Users = lazy(() => import("./pages/Admin/Users"));
const Statistics = lazy(() => import("./pages/Admin/Statistics"));
const Comments = lazy(() => import("./pages/Admin/Comments"));
const Variants = lazy(() => import("./pages/Admin/Variants"));
const DiscountCodes = lazy(() => import("./pages/Admin/DiscountCodes"));
const Brands = lazy(() => import("./pages/Admin/Brands"));

// Người gác cổng cho trang Admin
import AdminRoute from "./components/AdminRoute";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem("access_token") || localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem("access_token") || localStorage.getItem("token");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function ConditionalHeader() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <Header />;
}

function App() {
  return (
    <BrowserRouter>
      <QuickAddProvider>
        <ConditionalHeader />

        <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Đang tải...</div>}>
        <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products/ao" element={<AoPage />} />
        <Route path="/products/giay" element={<GiayPage />} />
        <Route path="/products/pants" element={<QuanPage />} />
        <Route path="/products/phu-kien" element={<TuiPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/size-guide" element={<SizeGuide />} />
<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
        {/* Chỉ dành cho khách chưa đăng nhập */}
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        {/* Bắt buộc đăng nhập */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipping-info"
          element={
            <ProtectedRoute>
              <ShippingInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Navigate to="/shipping-info" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/failed"
          element={
            <ProtectedRoute>
              <CheckoutFailedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminRoute />}>
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
            <Route path="brands" element={<Brands />} />
          </Route>
        </Route>
        </Routes>
        </Suspense>
      </QuickAddProvider>
    </BrowserRouter>
  );
}

export default App;
