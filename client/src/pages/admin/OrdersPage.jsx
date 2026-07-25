import { useState, useEffect, useCallback } from 'react'
import { adminOrderApi } from '../../api'
import { Search, ShoppingBag, Loader, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  pending:    { label: 'Chờ xử lý',  badge: 'badge-warning', next: [{ value: 'processing', label: 'Xác nhận' }, { value: 'cancelled', label: 'Huỷ đơn' }] },
  processing: { label: 'Đang xử lý', badge: 'badge-info',    next: [{ value: 'shipped', label: 'Giao hàng' }, { value: 'cancelled', label: 'Huỷ đơn' }] },
  shipped:    { label: 'Đang giao',  badge: 'badge-purple',  next: [{ value: 'delivered', label: 'Xác nhận giao' }] },
  delivered:  { label: 'Đã giao',    badge: 'badge-success', next: [] },
  cancelled:  { label: 'Đã huỷ',     badge: 'badge-danger',  next: [] },
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')
  const [page,    setPage]    = useState(1)
  const [detail,  setDetail]  = useState(null) // order chi tiết modal
  const [updating,setUpdating]= useState(null) // orderId đang cập nhật

  const fetchOrders = useCallback(() => {
    setLoading(true)
    adminOrderApi.list({ search, status, page, per_page: 15 })
      .then(res => {
        setOrders(res.data.data)
        setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total })
      })
      .catch(() => toast.error('Không thể tải đơn hàng!'))
      .finally(() => setLoading(false))
  }, [search, status, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const res = await adminOrderApi.updateStatus(orderId, newStatus)
      toast.success('Cập nhật trạng thái thành công!')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (detail?.id === orderId) setDetail(res.data.order)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setUpdating(null)
    }
  }

  const openDetail = async (id) => {
    try {
      const res = await adminOrderApi.get(id)
      setDetail(res.data)
    } catch { toast.error('Không thể tải chi tiết đơn hàng!') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đơn hàng</h1>
          <p className="page-subtitle">Tổng cộng {meta.total} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input className="form-control" placeholder="Tìm theo tên, email khách..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s === '' ? 'Tất cả' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#ID</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <ShoppingBag size={40} className="empty-state-icon" />
                  <p className="empty-state-text">Không có đơn hàng nào</p>
                </div>
              </td></tr>
            ) : orders.map(o => {
              const cfg = STATUS_CONFIG[o.status]
              const next = cfg?.next ?? []
              return (
                <tr key={o.id}>
                  <td className="font-bold text-accent">#{o.id}</td>
                  <td>
                    <div className="font-semibold">{o.user?.name ?? '—'}</div>
                    <div className="text-xs text-muted">{o.user?.email}</div>
                  </td>
                  <td className="font-semibold">{fmt(o.total_amount)}</td>
                  <td><span className={`badge ${cfg?.badge}`}>{cfg?.label}</span></td>
                  <td className="text-muted text-sm">
                    {new Date(o.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(o.id)}>
                        Chi tiết
                      </button>
                      {next.length > 0 && (
                        <div style={{ position: 'relative' }} className="status-dropdown">
                          <select className="form-control btn-sm" style={{ width: 130, padding: '5px 8px' }}
                            disabled={updating === o.id}
                            onChange={e => { if(e.target.value) handleUpdateStatus(o.id, e.target.value); e.target.value = '' }}
                            defaultValue="">
                            <option value="" disabled>Cập nhật...</option>
                            {next.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="pagination">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết đơn hàng #{detail.id}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="grid-2 mb-4">
              <div>
                <p className="text-xs text-muted mb-1">KHÁCH HÀNG</p>
                <p className="font-semibold">{detail.user?.name}</p>
                <p className="text-sm text-muted">{detail.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">TRẠNG THÁI</p>
                <span className={`badge ${STATUS_CONFIG[detail.status]?.badge}`}>
                  {STATUS_CONFIG[detail.status]?.label}
                </span>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Sản phẩm</th><th>Size/Màu</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                <tbody>
                  {detail.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.variant?.product?.name ?? '—'}</td>
                      <td className="text-muted text-sm">{item.variant?.size} / {item.variant?.color}</td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.price)}</td>
                      <td className="font-semibold text-accent">{fmt(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span className="text-muted">Tổng cộng:</span>
              <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--accent-light)' }}>
                {fmt(detail.total_amount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
