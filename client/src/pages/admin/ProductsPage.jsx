import { useState, useEffect, useCallback } from 'react'
import { adminProductApi, adminCategoryApi, adminBrandApi } from '../../api'
import { Plus, Search, Edit, Trash2, Package, Loader, Layers, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// ── Variant Manager (tab biến thể trong modal chỉnh sửa) ─────────────────────
function VariantManager({ productId }) {
  const [variants,    setVariants]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState(null)
  const [form,        setForm]        = useState({ size: '', color: '', stock: '' })
  const [editingId,   setEditingId]   = useState(null)
  const [editForm,    setEditForm]    = useState({})

  const fetchVariants = useCallback(() => {
    setLoading(true)
    adminProductApi.get(productId)
      .then(res => setVariants(res.data.variants ?? []))
      .catch(() => toast.error('Không thể tải biến thể!'))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => { fetchVariants() }, [fetchVariants])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.size.trim() || !form.color.trim()) return toast.error('Vui lòng nhập size và màu!')
    setSaving(true)
    try {
      await adminProductApi.addVariant(productId, {
        size: form.size.trim(),
        color: form.color.trim(),
        stock: parseInt(form.stock) || 0,
      })
      toast.success('Thêm biến thể thành công!')
      setForm({ size: '', color: '', stock: '' })
      fetchVariants()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (v) => {
    setEditingId(v.id)
    setEditForm({ size: v.size, color: v.color, stock: v.stock })
  }

  const handleUpdate = async (id) => {
    setSaving(true)
    try {
      await adminProductApi.updateVariant(productId, id, editForm)
      toast.success('Cập nhật biến thể thành công!')
      setEditingId(null)
      fetchVariants()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá biến thể này?')) return
    setDeleting(id)
    try {
      await adminProductApi.deleteVariant(productId, id)
      toast.success('Đã xoá biến thể!')
      fetchVariants()
    } catch {
      toast.error('Xoá thất bại!')
    } finally {
      setDeleting(null)
    }
  }

  const totalStock = variants.reduce((s, v) => s + (parseInt(v.stock) || 0), 0)

  return (
    <div>
      {/* Tổng tồn kho */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', background: 'rgba(139,92,246,0.08)',
        borderRadius: 10, border: '1px solid rgba(139,92,246,0.2)',
        marginBottom: 16,
      }}>
        <Layers size={16} color="var(--accent-light)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tổng tồn kho:
        </span>
        <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{totalStock} sản phẩm</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {variants.length} biến thể
        </span>
      </div>

      {/* Bảng biến thể hiện có */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : variants.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          color: 'var(--text-muted)', fontSize: '0.85rem',
          border: '1px dashed var(--border)', borderRadius: 10, marginBottom: 16,
        }}>
          Chưa có biến thể nào. Thêm biến thể bên dưới.
        </div>
      ) : (
        <div className="table-wrapper" style={{ marginBottom: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Màu sắc</th>
                <th>Tồn kho</th>
                <th style={{ width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.id}>
                  <td>
                    {editingId === v.id ? (
                      <input className="form-control" style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                        value={editForm.size}
                        onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))} />
                    ) : (
                      <span className="badge badge-muted">{v.size}</span>
                    )}
                  </td>
                  <td>
                    {editingId === v.id ? (
                      <input className="form-control" style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                        value={editForm.color}
                        onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: v.color?.toLowerCase() || '#888',
                          border: '1px solid var(--border)', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.85rem' }}>{v.color}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === v.id ? (
                      <input className="form-control" type="number" min="0"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 80 }}
                        value={editForm.stock}
                        onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} />
                    ) : (
                      <span className={`badge ${v.stock > 10 ? 'badge-success' : v.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {v.stock}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {editingId === v.id ? (
                        <>
                          <button className="btn btn-success btn-sm btn-icon" title="Lưu"
                            onClick={() => handleUpdate(v.id)} disabled={saving}>
                            <Save size={13} />
                          </button>
                          <button className="btn btn-secondary btn-sm btn-icon" title="Huỷ"
                            onClick={() => setEditingId(null)}>
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secondary btn-sm btn-icon" title="Sửa"
                            onClick={() => startEdit(v)}>
                            <Edit size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Xoá"
                            onClick={() => handleDelete(v.id)}
                            disabled={deleting === v.id}>
                            {deleting === v.id ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form thêm biến thể mới */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '14px 16px',
      }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ➕ Thêm biến thể mới
        </p>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px auto', gap: 8, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Size *</label>
              <input className="form-control" placeholder="S, M, L, 39, 40..."
                value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Màu sắc *</label>
              <input className="form-control" placeholder="Đen, Trắng, Đỏ..."
                value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Tồn kho</label>
              <input className="form-control" type="number" min="0" placeholder="0"
                value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}
              style={{ height: 38, paddingLeft: 14, paddingRight: 14 }}>
              {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ProductsPage ─────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [brands,     setBrands]     = useState([])
  const [meta,       setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState({ category_id: '', brand_id: '', status: '' })
  const [page,       setPage]       = useState(1)
  const [modal,      setModal]      = useState(null) // null | 'create' | 'edit' | 'variants'
  const [selected,   setSelected]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [activeTab,  setActiveTab]  = useState('info') // 'info' | 'variants'
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

  const openCreate = () => {
    setForm(emptyForm())
    setSelected(null)
    setActiveTab('info')
    setModal('create')
  }

  const openEdit = (p) => {
    setForm({
      name: p.name, category_id: p.category_id, brand_id: p.brand_id,
      price: p.price, description: p.description ?? '',
      status: p.status, thumbnail: p.thumbnail ?? '', sku: p.sku ?? '',
    })
    setSelected(p)
    setActiveTab('info')
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

  // Kiểm tra xem sản phẩm có biến thể không (từ data đã load)
  const getVariantCount = (p) => p.variants?.length ?? 0
  const getTotalStock   = (p) => p.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0

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
              <th>Biến thể / Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7}>
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
                      <div className="font-semibold" style={{ maxWidth: 180 }}>{p.name}</div>
                      <div className="text-xs text-muted">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-muted">{p.category?.name ?? '—'}</span></td>
                <td className="text-muted text-sm">{p.brand?.name ?? '—'}</td>
                <td className="font-semibold text-accent">{fmt(p.price)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span className="badge badge-info">{getVariantCount(p)} biến thể</span>
                    <span className={`badge ${getTotalStock(p) > 0 ? 'badge-success' : 'badge-danger'}`}>
                      Kho: {getTotalStock(p)}
                    </span>
                  </div>
                </td>
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
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setSelected(p); setModal('variants') }}
                      title="Quản lý biến thể"
                      style={{ gap: 4, fontSize: '0.75rem' }}
                    >
                      <Layers size={13} /> Kho
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

      {/* Create/Edit Modal — với 2 tab: Thông tin & Biến thể */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">
                {modal === 'create' ? '➕ Thêm sản phẩm mới' : '✏️ Chỉnh sửa sản phẩm'}
              </h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, padding: '0 0 16px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {[
                { key: 'info', label: '📋 Thông tin' },
                ...(modal === 'edit' ? [{ key: 'variants', label: '📦 Biến thể & Tồn kho' }] : []),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Thông tin */}
            {activeTab === 'info' && (
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
            )}

            {/* Tab: Biến thể (chỉ hiện khi edit) */}
            {activeTab === 'variants' && modal === 'edit' && (
              <VariantManager productId={selected.id} />
            )}
          </div>
        </div>
      )}

      {/* Modal Quản lý biến thể riêng (từ nút Kho trên bảng) */}
      {modal === 'variants' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">📦 Quản lý biến thể & Tồn kho</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {selected.name}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setModal(null); fetchProducts() }}>✕</button>
            </div>
            <VariantManager productId={selected.id} />
          </div>
        </div>
      )}
    </div>
  )
}
