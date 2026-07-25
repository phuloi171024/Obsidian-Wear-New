import { useState, useEffect, useCallback } from 'react'
import { adminBrandApi } from '../../api'
import { Plus, Edit, Trash2, Award, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BrandsPage() {
  const [brands,  setBrands]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [selected,setSelected]= useState(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({ name: '', status: true })

  const fetch = useCallback(() => {
    setLoading(true)
    adminBrandApi.list().then(res => setBrands(res.data)).catch(() => toast.error('Lỗi!')).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setForm({ name: '', status: true }); setSelected(null); setModal('form') }
  const openEdit   = (b) => { setForm({ name: b.name, status: b.status }); setSelected(b); setModal('form') }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (!selected) { await adminBrandApi.create(form); toast.success('Tạo thương hiệu thành công!') }
      else           { await adminBrandApi.update(selected.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetch()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach(v => toast.error(v[0]))
      else toast.error(err.response?.data?.message || 'Có lỗi!')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá thương hiệu này?')) return
    try { await adminBrandApi.delete(id); toast.success('Đã xoá!'); fetch() }
    catch (err) { toast.error(err.response?.data?.message || 'Xoá thất bại!') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thương hiệu</h1>
          <p className="page-subtitle">{brands.length} thương hiệu</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Thêm thương hiệu</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Thương hiệu</th><th>Slug</th><th>Sản phẩm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : brands.map(b => (
              <tr key={b.id}>
                <td>
                  <div className="flex items-center gap-3">
                    {b.logo
                      ? <img src={b.logo} alt={b.name} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', padding: 2 }} />
                      : <div style={{ width: 36, height: 36, background: 'rgba(59,130,246,0.1)', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Award size={16} color="var(--info)" />
                        </div>
                    }
                    <span className="font-semibold">{b.name}</span>
                  </div>
                </td>
                <td className="text-muted text-sm">{b.slug}</td>
                <td><span className="badge badge-info">{b.products_count ?? 0} sản phẩm</span></td>
                <td><span className={`badge ${b.status ? 'badge-success' : 'badge-danger'}`}>{b.status ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(b)}><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button>
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
              <h2 className="modal-title">{selected ? '✏️ Sửa thương hiệu' : '➕ Thêm thương hiệu'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Tên thương hiệu *</label>
                <input className="form-control" required placeholder="Nike, Adidas..." value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={form.status} onChange={e => setForm(f => ({...f, status: e.target.checked}))} />
                <span className="form-label" style={{ margin: 0 }}>Hiển thị</span>
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
