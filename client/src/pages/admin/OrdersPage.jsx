import { useState, useEffect, useCallback } from 'react'
import { adminOrderApi } from '../../api'
import { Search, ShoppingBag, Loader, MapPin, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  pending:          { label: 'Chờ xử lý',   badge: 'badge-warning', color: '#f59e0b',
                      next: [{ value: 'processing', label: '✅ Xác nhận' }, { value: 'cancelled', label: '❌ Huỷ đơn' }] },
  processing:       { label: 'Đang xử lý',  badge: 'badge-info',    color: '#3b82f6',
                      next: [{ value: 'shipped', label: '🚚 Giao hàng' }, { value: 'cancelled', label: '❌ Huỷ đơn' }] },
  shipped:          { label: 'Đang giao',   badge: 'badge-purple',  color: '#8b5cf6',
                      next: [{ value: 'delivered', label: '✔️ Xác nhận giao' }, { value: 'return_requested', label: '↩️ Yêu cầu trả' }] },
  delivered:        { label: 'Đã giao',     badge: 'badge-success', color: '#10b981',
                      next: [{ value: 'return_requested', label: '↩️ Yêu cầu đổi trả' }] },
  cancelled:        { label: 'Đã huỷ',      badge: 'badge-danger',  color: '#ef4444',  next: [] },
  return_requested: { label: 'Yêu cầu trả', badge: 'badge-orange',  color: '#f97316',
                      next: [{ value: 'returned', label: '↩️ Xác nhận hoàn trả' }, { value: 'delivered', label: '✔️ Từ chối / Giữ nguyên' }] },
  returned:         { label: 'Đã hoàn trả', badge: 'badge-muted',   color: '#9ca3af',  next: [] },
}

// Timeline trạng thái
const TIMELINE_STEPS = ['pending', 'processing', 'shipped', 'delivered']

function StatusTimeline({ currentStatus }) {
  if (['cancelled', 'return_requested', 'returned'].includes(currentStatus)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span className={`badge ${STATUS_CONFIG[currentStatus]?.badge}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          {STATUS_CONFIG[currentStatus]?.label}
        </span>
      </div>
    )
  }
  const curIdx = TIMELINE_STEPS.indexOf(currentStatus)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {TIMELINE_STEPS.map((step, i) => {
        const cfg   = STATUS_CONFIG[step]
        const done  = i <= curIdx
        const isNow = i === curIdx
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE_STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? cfg.color : 'rgba(255,255,255,0.08)',
                border: `2px solid ${done ? cfg.color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: done ? '#fff' : 'var(--text-muted)',
                boxShadow: isNow ? `0 0 10px ${cfg.color}66` : 'none',
                transition: 'all 0.3s',
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '0.65rem', color: done ? cfg.color : 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: done ? 600 : 400 }}>
                {cfg.label}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 18,
                background: i < curIdx ? cfg.color : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrdersPage() {
  const [orders,   setOrders]   = useState([])
  const [meta,     setMeta]     = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [detail,   setDetail]   = useState(null)
  const [updating, setUpdating] = useState(null)

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

  // Các tab lọc trạng thái
  const filterTabs = [
    { value: '', label: 'Tất cả' },
    { value: 'pending',          label: '⏳ Chờ xử lý' },
    { value: 'processing',       label: '⚙️ Đang xử lý' },
    { value: 'shipped',          label: '🚚 Đang giao' },
    { value: 'delivered',        label: '✅ Đã giao' },
    { value: 'return_requested', label: '↩️ Yêu cầu trả' },
    { value: 'returned',         label: '📦 Đã hoàn trả' },
    { value: 'cancelled',        label: '❌ Đã huỷ' },
  ]

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
          {filterTabs.map(s => (
            <button key={s.value} onClick={() => { setStatus(s.value); setPage(1) }}
              className={`btn btn-sm ${status === s.value ? 'btn-primary' : 'btn-secondary'}`}>
              {s.label}
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
              const cfg  = STATUS_CONFIG[o.status]
              const next = cfg?.next ?? []
              return (
                <tr key={o.id}>
                  <td className="font-bold text-accent">#{o.id}</td>
                  <td>
                    <div className="font-semibold">{o.user?.name ?? '—'}</div>
                    <div className="text-xs text-muted">{o.user?.email}</div>
                  </td>
                  <td className="font-semibold">{fmt(o.total_amount)}</td>
                  <td>
                    <span className={`badge ${cfg?.badge}`}>{cfg?.label}</span>
                    {/* Badge đặc biệt cho đổi trả */}
                    {o.status === 'return_requested' && (
                      <div style={{ marginTop: 4 }}>
                        <span style={{
                          fontSize: '0.65rem', color: '#f97316',
                          background: 'rgba(249,115,22,0.1)',
                          border: '1px solid rgba(249,115,22,0.3)',
                          borderRadius: 4, padding: '1px 6px',
                        }}>
                          ⚠️ Cần xử lý
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="text-muted text-sm">
                    {new Date(o.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(o.id)}>
                        Chi tiết
                      </button>
                      {next.length > 0 && (
                        <select className="form-control btn-sm" style={{ width: 140, padding: '5px 8px' }}
                          disabled={updating === o.id}
                          onChange={e => { if (e.target.value) handleUpdateStatus(o.id, e.target.value); e.target.value = '' }}
                          defaultValue="">
                          <option value="" disabled>
                            {updating === o.id ? 'Đang cập nhật...' : 'Cập nhật...'}
                          </option>
                          {next.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                        </select>
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
              <div>
                <h2 className="modal-title">Chi tiết đơn hàng #{detail.id}</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Đặt ngày {new Date(detail.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDetail(null)}>✕</button>
            </div>

            {/* Timeline */}
            <StatusTimeline currentStatus={detail.status} />

            {/* Thông tin khách + Trạng thái */}
            <div className="grid-2 mb-4">
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <p className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Khách hàng</p>
                <p className="font-semibold">{detail.user?.name}</p>
                <p className="text-sm text-muted">{detail.user?.email}</p>
                {detail.user?.phone && <p className="text-sm text-muted">{detail.user.phone}</p>}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <p className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái hiện tại</p>
                <span className={`badge ${STATUS_CONFIG[detail.status]?.badge}`} style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
                  {STATUS_CONFIG[detail.status]?.label}
                </span>
                {/* Nút cập nhật trong modal */}
                {(STATUS_CONFIG[detail.status]?.next?.length ?? 0) > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p className="text-xs text-muted mb-2">Chuyển sang:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {STATUS_CONFIG[detail.status].next.map(n => (
                        <button key={n.value}
                          className={`btn btn-sm ${n.value === 'cancelled' || n.value === 'returned' ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleUpdateStatus(detail.id, n.value)}
                          disabled={updating === detail.id}
                          style={{ fontSize: '0.78rem' }}>
                          {updating === detail.id ? <Loader size={12} className="animate-spin" /> : n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon nếu có */}
            {detail.coupon && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', marginBottom: 12,
                background: 'rgba(16,185,129,0.08)', borderRadius: 8,
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                  🎫 {detail.coupon.code}
                </span>
                <span className="text-sm text-muted">— Giảm {fmt(detail.coupon.discount_value)}</span>
              </div>
            )}

            {/* Bảng sản phẩm */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Size / Màu</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items?.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {item.variant?.product?.thumbnail && (
                            <img src={item.variant.product.thumbnail} alt=""
                              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                          )}
                          <span>{item.variant?.product?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="text-muted text-sm">{item.variant?.size} / {item.variant?.color}</td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.price)}</td>
                      <td className="font-semibold text-accent">{fmt(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tổng tiền */}
            <div className="flex justify-between items-center mt-4" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div>
                {detail.coupon && (
                  <div className="text-sm text-muted" style={{ marginBottom: 4 }}>
                    Giảm giá coupon: <span style={{ color: '#10b981' }}>-{fmt(detail.coupon.discount_value)}</span>
                  </div>
                )}
                <span className="text-muted">Tổng cộng:</span>
              </div>
              <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--accent-light)' }}>
                {fmt(detail.total_amount)}
              </span>
            </div>

            {/* Ghi chú đặc biệt cho đơn đổi trả */}
            {detail.status === 'return_requested' && (
              <div style={{
                marginTop: 16, padding: '14px 16px',
                background: 'rgba(249,115,22,0.08)', borderRadius: 10,
                border: '1px solid rgba(249,115,22,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <RefreshCw size={16} color="#f97316" />
                  <span style={{ fontWeight: 600, color: '#f97316', fontSize: '0.9rem' }}>
                    Yêu cầu đổi / trả hàng
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Khách hàng đã yêu cầu đổi hoặc trả hàng. Vui lòng liên hệ khách hàng và xử lý yêu cầu.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
