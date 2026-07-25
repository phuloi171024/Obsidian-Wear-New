import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Award,
  ShoppingBag, Users, Ticket, Star,
  LogOut, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './Sidebar.css'

const navItems = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',    exact: true },
  { to: '/admin/products',  icon: Package,         label: 'Sản phẩm' },
  { to: '/admin/categories',icon: Tag,             label: 'Danh mục' },
  { to: '/admin/brands',    icon: Award,           label: 'Thương hiệu' },
  { to: '/admin/orders',    icon: ShoppingBag,     label: 'Đơn hàng' },
  { to: '/admin/users',     icon: Users,           label: 'Người dùng' },
  { to: '/admin/coupons',   icon: Ticket,          label: 'Coupon' },
  { to: '/admin/reviews',   icon: Star,            label: 'Đánh giá' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất!')
    navigate('/admin/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">OW</div>
        <div>
          <div className="sidebar-logo-title">Obsidian Wear</div>
          <div className="sidebar-logo-sub">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">MENU</div>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="sidebar-link-arrow" />
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Đăng xuất">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
