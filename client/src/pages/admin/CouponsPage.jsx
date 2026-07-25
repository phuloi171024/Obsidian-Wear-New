import { useState, useEffect, useCallback } from 'react'
import { adminCouponApi } from '../../api'
import { Plus, Edit, Trash2, Ticket, Loader, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [selected,setSelected]= useState(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({ code: '', discount_value: '', end_date: '', status: true })

  const fetch = useCallback(() => {
    setLoading(true)
    adminCouponApi.list().then(res => setCoupons(res.data)).catch(() => toast.error('Lỗi!')).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setForm({ code: '', discount_value: '', end_date: '', status: true }); setSelected(null); setModal('form') }
  const openEdit   = (c) => { setForm({ code: c.code, discount_value: c.discount_value, end_date: c.end_date ? c.end_date.split('T')[0] : '', status: c.status }); setSelected(c); setModal('form') }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (!selected) { await adminCouponApi.create(form); toast.success('Tạo coupon thành công!') }
      else           { await adminCouponApi.update(selected.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetch()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach(v => toast.error(v[0]))
      else toast.error(err.response?.data?.message || 'Có lỗi!')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá coupon này?')) return
    try { await adminCouponApi.delete(id); toast.success('Đã xoá!'); fetch() }
    catch { toast.error('Xoá thất bại!') }
  }

  const handleToggle = async (c) => {
    try {
      await adminCouponApi.update(c.id, { status: !c.status })
      toast.success('Cập nhật trạng thái!')
      fetch()
    } catch { toast.error('Lỗi!') }
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupon</h1>
          <p className="page-subtitle">{coupons.length} mã giảm giá</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Tạo coupon</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Mã coupon</th><th>Giảm giá</th><th>Ngày hết hạn</th><th>Đã dùng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : coupons.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{
                    display: 'inline-block', background: 'rgba(139,92,246,0.1)', border: '1px dashed var(--accent)',
                    borderRadius: 6, padding: '3px 10px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-light)',
                  }}>{c.code}</div>
                </td>
                <td className="font-bold text-success">
                  -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(c.discount_value)}
                </td>
                <td className="text-muted text-sm">{fmtDate(c.end_date)}</td>
                <td><span className="badge badge-info">{c.orders_count ?? 0} lần</span></td>
                <td>
                  <button className={`btn btn-sm ${c.status ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => handleToggle(c)} style={{ gap: 4 }}>
                    {c.status ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {c.status ? 'Hoạt động' : 'Tắt'}
                  </button>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(c)}><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{selected ? '✏️ Sửa coupon' : '➕ Tạo coupon'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Mã coupon *</label>
                <input className="form-control" required placeholder="SUMMER20" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Giảm giá (VNĐ) *</label>
                <input className="form-control" type="number" min="0" required placeholder="50000"
                  value={form.discount_value} onChange={e => setForm(f => ({...f, discount_value: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày hết hạn</label>
                <input className="form-control" type="date"
                  value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} />
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={form.status} onChange={e => setForm(f => ({...f, status: e.target.checked}))} />
                <span className="form-label" style={{ margin: 0 }}>Kích hoạt</span>
              </label>
              <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader size={15} className="animate-spin" /> : null}
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
