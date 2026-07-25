import { useState, useEffect, useCallback } from 'react'
import { adminReviewApi } from '../../api'
import { Search, Star, CheckCircle, EyeOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  approved: { label: 'Đã duyệt', badge: 'badge-success' },
  pending:  { label: 'Chờ duyệt', badge: 'badge-warning' },
  hidden:   { label: 'Đã ẩn', badge: 'badge-danger' },
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')
  const [rating,  setRating]  = useState('')
  const [page,    setPage]    = useState(1)

  const fetch = useCallback(() => {
    setLoading(true)
    adminReviewApi.list({ status, rating, page, per_page: 20 })
      .then(res => {
        setReviews(res.data.data)
        setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total })
      })
      .catch(() => toast.error('Không thể tải đánh giá!'))
      .finally(() => setLoading(false))
  }, [status, rating, page])

  useEffect(() => { fetch() }, [fetch])

  const handleApprove = async (id) => {
    try { await adminReviewApi.approve(id); toast.success('Đã duyệt!'); fetch() }
    catch { toast.error('Lỗi!') }
  }

  const handleHide = async (id) => {
    try { await adminReviewApi.hide(id); toast.success('Đã ẩn!'); fetch() }
    catch { toast.error('Lỗi!') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá đánh giá này?')) return
    try { await adminReviewApi.delete(id); toast.success('Đã xoá!'); fetch() }
    catch { toast.error('Xoá thất bại!') }
  }

  const Stars = ({ count }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} fill={i <= count ? '#f59e0b' : 'none'} color={i <= count ? '#f59e0b' : '#524f6a'} />
      ))}
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Đánh giá</h1>
          <p className="page-subtitle">Tổng {meta.total} đánh giá</p>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          {['', 'pending', 'approved', 'hidden'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s === '' ? 'Tất cả' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
          <select className="form-control" style={{ width: 130 }}
            value={rating} onChange={e => { setRating(e.target.value); setPage(1) }}>
            <option value="">Mọi sao</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} sao</option>)}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Người dùng</th><th>Sản phẩm</th><th>Đánh giá</th><th>Bình luận</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><Star size={40} className="empty-state-icon" /><p className="empty-state-text">Không có đánh giá nào</p></div></td></tr>
            ) : reviews.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="font-semibold">{r.user?.name ?? '—'}</div>
                  <div className="text-xs text-muted">{r.user?.email}</div>
                </td>
                <td>
                  <div className="text-sm font-semibold" style={{ maxWidth: 160 }}>{r.product?.name ?? '—'}</div>
                </td>
                <td><Stars count={r.rating} /></td>
                <td>
                  <div className="text-sm text-muted truncate" style={{ maxWidth: 200 }}>
                    {r.comment || <em>Không có bình luận</em>}
                  </div>
                </td>
                <td><span className={`badge ${STATUS_CONFIG[r.status]?.badge}`}>{STATUS_CONFIG[r.status]?.label}</span></td>
                <td className="text-muted text-xs">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="flex gap-2">
                    {r.status !== 'approved' && (
                      <button className="btn btn-success btn-sm btn-icon" title="Duyệt" onClick={() => handleApprove(r.id)}>
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {r.status !== 'hidden' && (
                      <button className="btn btn-secondary btn-sm btn-icon" title="Ẩn" onClick={() => handleHide(r.id)}>
                        <EyeOff size={14} />
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm btn-icon" title="Xoá" onClick={() => handleDelete(r.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta.last_page > 1 && (
        <div className="pagination">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}
