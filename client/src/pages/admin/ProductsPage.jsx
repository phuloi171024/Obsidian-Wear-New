import { useState, useEffect, useCallback } from 'react'
import { adminProductApi, adminCategoryApi, adminBrandApi } from '../../api'
import { Plus, Search, Edit, Trash2, Eye, Package, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

export default function ProductsPage() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [brands,     setBrands]     = useState([])
  const [meta,       setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState({ category_id: '', brand_id: '', status: '' })
  const [page,       setPage]       = useState(1)
  const [modal,      setModal]      = useState(null) // null | 'create' | 'edit' | 'view'
  const [selected,   setSelected]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [form,       setForm]       = useState(emptyForm())

  function emptyForm() {
    return { name: '', category_id: '', brand_id: '', price: '', description: '', status: true, thumbnail: '', sku: '' }
  }

  const fetchProducts = useCallback(() => {
    setLoading(true)
    adminProductApi.list({ ...filters, search, page, per_page: 12 })
      .then(res => {
        setProducts(res.data.data)
        setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total })
      })
      .catch(() => toast.error('Không thể tải danh sách sản phẩm!'))
      .finally(() => setLoading(false))
  }, [filters, search, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    adminCategoryApi.list().then(r => setCategories(r.data))
    adminBrandApi.list().then(r => setBrands(r.data))
  }, [])

  const openCreate = () => { setForm(emptyForm()); setSelected(null); setModal('create') }
  const openEdit   = (p) => {
    setForm({ name: p.name, category_id: p.category_id, brand_id: p.brand_id, price: p.price,
              description: p.description ?? '', status: p.status, thumbnail: p.thumbnail ?? '', sku: p.sku ?? '' })
    setSelected(p)
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await adminProductApi.create(form)
        toast.success('Tạo sản phẩm thành công!')
      } else {
        await adminProductApi.update(selected.id, form)
        toast.success('Cập nhật sản phẩm thành công!')
      }
      setModal(null)
      fetchProducts()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach(v => toast.error(v[0]))
      else toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xoá sản phẩm này?')) return
    try {
      await adminProductApi.delete(id)
      toast.success('Đã xoá sản phẩm!')
      fetchProducts()
    } catch {
      toast.error('Xoá thất bại!')
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sản phẩm</h1>
          <p className="page-subtitle">Quản lý {meta.total} sản phẩm</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              className="form-control"
              placeholder="Tìm theo tên, SKU..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="form-control" style={{ width: 170 }}
            value={filters.category_id}
            onChange={e => { setFilters(f => ({...f, category_id: e.target.value})); setPage(1) }}>
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="form-control" style={{ width: 160 }}
            value={filters.brand_id}
            onChange={e => { setFilters(f => ({...f, brand_id: e.target.value})); setPage(1) }}>
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="form-control" style={{ width: 130 }}
            value={filters.status}
            onChange={e => { setFilters(f => ({...f, status: e.target.value})); setPage(1) }}>
            <option value="">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <Package size={40} className="empty-state-icon" />
                  <p className="empty-state-text">Không có sản phẩm nào</p>
                </div>
              </td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      : <div style={{ width: 44, height: 44, background: 'rgba(139,92,246,0.1)', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Package size={18} color="var(--accent-light)" />
                        </div>
                    }
                    <div>
                      <div className="font-semibold" style={{ maxWidth: 200 }}>{p.name}</div>
                      <div className="text-xs text-muted">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-muted">{p.category?.name ?? '—'}</span></td>
                <td className="text-muted text-sm">{p.brand?.name ?? '—'}</td>
                <td className="font-semibold text-accent">{fmt(p.price)}</td>
                <td>
                  <span className={`badge ${p.status ? 'badge-success' : 'badge-danger'}`}>
                    {p.status ? 'Đang bán' : 'Đã ẩn'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(p)} title="Chỉnh sửa">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p.id)} title="Xoá">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? '➕ Thêm sản phẩm mới' : '✏️ Chỉnh sửa sản phẩm'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input className="form-control" required placeholder="Áo thun Obsidian..."
                    value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-control" placeholder="OW-001"
                    value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select className="form-control" required
                    value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Thương hiệu *</label>
                  <select className="form-control" required
                    value={form.brand_id} onChange={e => setForm(f => ({...f, brand_id: e.target.value}))}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giá (VNĐ) *</label>
                  <input className="form-control" type="number" min="0" required placeholder="299000"
                    value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh thumbnail (URL)</label>
                  <input className="form-control" placeholder="https://..."
                    value={form.thumbnail} onChange={e => setForm(f => ({...f, thumbnail: e.target.value}))} />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="form-label">Mô tả</label>
                <textarea className="form-control" placeholder="Mô tả chi tiết sản phẩm..."
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className="form-group mt-2">
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.status}
                    onChange={e => setForm(f => ({...f, status: e.target.checked}))} />
                  <span className="form-label" style={{ margin: 0 }}>Hiển thị (đang bán)</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader size={15} className="animate-spin" /> : null}
                  {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
