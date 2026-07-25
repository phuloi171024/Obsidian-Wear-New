import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import './Header.css'

const pageTitles = {
  '/admin':            { title: 'Dashboard', sub: 'Tổng quan hệ thống' },
  '/admin/products':   { title: 'Sản phẩm',  sub: 'Quản lý kho hàng' },
  '/admin/categories': { title: 'Danh mục',  sub: 'Phân loại sản phẩm' },
  '/admin/brands':     { title: 'Thương hiệu', sub: 'Quản lý nhà cung cấp' },
  '/admin/orders':     { title: 'Đơn hàng',  sub: 'Theo dõi đơn hàng' },
  '/admin/users':      { title: 'Người dùng', sub: 'Quản lý tài khoản' },
  '/admin/coupons':    { title: 'Coupon',     sub: 'Mã giảm giá' },
  '/admin/reviews':    { title: 'Đánh giá',  sub: 'Quản lý phản hồi' },
}

export default function Header() {
  const { pathname } = useLocation()
  const info = pageTitles[pathname]
    ?? Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1]
    ?? { title: 'Admin', sub: '' }

  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-sep" style={{ color: 'var(--accent-light)', fontSize: '0.7rem' }}>
            ◆
          </span>
          <div>
            <div className="header-title">{info.title}</div>
            {info.sub && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {info.sub}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-system-status">
          <span className="header-badge-dot" />
          Hệ thống hoạt động
        </div>
        <div className="header-date">{dateStr}</div>
      </div>
    </header>
  )
}
