import { useState, useEffect, useCallback } from 'react'
import { adminCategoryApi } from '../../api'
import { Plus, Edit, Trash2, Tag, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [selected,   setSelected]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [form,       setForm]       = useState({ name: '', status: true })

  const fetch = useCallback(() => {
    setLoading(true)
    adminCategoryApi.list()
      .then(res => setCategories(res.data))
      .catch(() => toast.error('Không thể tải danh mục!'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setForm({ name: '', status: true }); setSelected(null); setModal('form') }
  const openEdit   = (c) => { setForm({ name: c.name, status: c.status }); setSelected(c); setModal('form') }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (!selected) { await adminCategoryApi.create(form); toast.success('Tạo danh mục thành công!') }
      else           { await adminCategoryApi.update(selected.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetch()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach(v => toast.error(v[0]))
      else toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá danh mục này?')) return
    try { await adminCategoryApi.delete(id); toast.success('Đã xoá!'); fetch() }
    catch (err) { toast.error(err.response?.data?.message || 'Xoá thất bại!') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Danh mục</h1>
          <p className="page-subtitle">{categories.length} danh mục</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Tên danh mục</th><th>Slug</th><th>Sản phẩm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><Tag size={40} className="empty-state-icon" /><p className="empty-state-text">Chưa có danh mục</p></div></td></tr>
            ) : categories.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    {c.image
                      ? <img src={c.image} alt={c.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      : <div style={{ width: 36, height: 36, background: 'rgba(139,92,246,0.1)', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Tag size={16} color="var(--accent-light)" />
                        </div>
                    }
                    <span className="font-semibold">{c.name}</span>
                  </div>
                </td>
                <td className="text-muted text-sm">{c.slug}</td>
                <td><span className="badge badge-info">{c.products_count ?? 0} sản phẩm</span></td>
                <td><span className={`badge ${c.status ? 'badge-success' : 'badge-danger'}`}>{c.status ? 'Hiển thị' : 'Ẩn'}</span></td>
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
              <h2 className="modal-title">{selected ? '✏️ Sửa danh mục' : '➕ Thêm danh mục'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Tên danh mục *</label>
                <input className="form-control" required placeholder="Áo, Quần, Giày..." value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
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
