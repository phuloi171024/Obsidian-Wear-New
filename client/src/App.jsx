import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

// Pages
import LoginPage      from './pages/auth/LoginPage'
import DashboardPage  from './pages/admin/DashboardPage'
import ProductsPage   from './pages/admin/ProductsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import BrandsPage     from './pages/admin/BrandsPage'
import OrdersPage     from './pages/admin/OrdersPage'
import UsersPage      from './pages/admin/UsersPage'
import CouponsPage    from './pages/admin/CouponsPage'
import ReviewsPage    from './pages/admin/ReviewsPage'
import FlashSalePage  from './pages/admin/FlashSalePage'
import PostsPage      from './pages/admin/PostsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16161f',
              color: '#f1f0f8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Redirect root → admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Login */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index            element={<DashboardPage />} />
            <Route path="products"  element={<ProductsPage />} />
            <Route path="categories"element={<CategoriesPage />} />
            <Route path="brands"    element={<BrandsPage />} />
            <Route path="orders"    element={<OrdersPage />} />
            <Route path="users"     element={<UsersPage />} />
            <Route path="coupons"   element={<CouponsPage />} />
            <Route path="reviews"   element={<ReviewsPage />} />
            <Route path="flash-sales" element={<FlashSalePage />} />
            <Route path="posts"     element={<PostsPage />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
