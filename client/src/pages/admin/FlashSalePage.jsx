import { useState, useEffect, useCallback } from 'react'
import { adminFlashSaleApi, adminProductApi } from '../../api'
import { Plus, Edit, Trash2, Zap, Loader, X, Clock, Package, Search, CheckSquare, Square } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// Cấu hình trạng thái Flash Sale
const STATUS_CONFIG = {
  active:   { label: '🔴 Đang diễn ra', badge: 'badge-danger',  color: '#ef4444' },
  upcoming: { label: '🟡 Sắp diễn ra',  badge: 'badge-warning', color: '#f59e0b' },
  ended:    { label: '⚫ Đã kết thúc',   badge: 'badge-muted',   color: '#6b7280' },
  disabled: { label: '⚪ Đã tắt',        badge: 'badge-muted',   color: '#9ca3af' },
}

// Format datetime-local input
const toLocalInput = (dt) => {
  if (!dt) return ''
  return new Date(dt).toISOString().slice(0, 16)
}

// Hiển thị đếm ngược
function Countdown({ endTime }) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime) - new Date()
      if (diff <= 0) { setRemaining('Đã kết thúc'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}h ${m}m ${s}s`)
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [endTime])
  return <span style={{ fontFamily: 'monospace', color: '#ef4444', fontWeight: 700 }}>{remaining}</span>
}

// ── Modal thêm sản phẩm vào Flash Sale ────────────────────────────────────
function AddProductModal({ flashSaleId, existingIds, onClose, onAdded }) {
  const [products,  setProducts]  = useState([])
  const [search,    setSearch]    = useState('')
  const [selected,  setSelected]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    adminProductApi.list({ search, per_page: 20, status: 'active' })
      .then(res => setProducts(res.data.data ?? []))
      .finally(() => setLoading(false))
  }, [search])

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const handleAdd = async () => {
    if (!selected.length) return toast.error('Chọn ít nhất 1 sản phẩm!')
    setSaving(true)
    try {
      await adminFlashSaleApi.addProducts(flashSaleId, { product_ids: selected })
      toast.success(`Đã thêm ${selected.length} sản phẩm!`)
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm sản phẩm thất bại!')
    } finally { setSaving(false) }
  }

  const available = products.filter(p => !existingIds.includes(p.id))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">➕ Thêm sản phẩm vào Flash Sale</h2>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="search-box" style={{ marginBottom: 16 }}>
          <Search size={15} className="search-icon" />
          <input className="form-control" placeholder="Tìm sản phẩm..."
            value={search} onChange={e => { setSearch(e.target.value); setLoading(true) }} />
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : available.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
            Không có sản phẩm nào (đã thêm hết hoặc không tìm thấy)
          </p>
        ) : (
          <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {available.map(p => {
              const checked = selected.includes(p.id)
              return (
                <div key={p.id} onClick={() => toggle(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${checked ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                    background: checked ? 'rgba(239,68,68,0.06)' : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                  {checked ? <CheckSquare size={18} color="#ef4444" /> : <Square size={18} color="var(--text-muted)" />}
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                    : <div style={{ width: 36, height: 36, background: 'rgba(239,68,68,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="#ef4444" /></div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold" style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div className="text-xs text-muted">{fmt(p.price)}</div>
                  </div>
                  <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{p.category?.name}</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="modal-footer" style={{ marginTop: 16 }}>
          <span className="text-sm text-muted">Đã chọn: {selected.length} sản phẩm</span>
          <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
          <button className="btn btn-danger" onClick={handleAdd} disabled={saving || !selected.length}>
            {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? 'Đang thêm...' : `Thêm ${selected.length || ''} sản phẩm`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main FlashSalePage ────────────────────────────────────────────────────
function emptyForm() {
  const now  = new Date()
  const hour = new Date(now.getTime() + 3600000)
  const end  = new Date(now.getTime() + 7200000)
  return {
    name:             '',
    discount_percent: '',
    start_time:       toLocalInput(hour),
    end_time:         toLocalInput(end),
    status:           true,
  }
}

export default function FlashSalePage() {
  const [flashSales,  setFlashSales]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(null) // null | 'create' | 'edit' | 'detail'
  const [selected,    setSelected]    = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(emptyForm())
  const [filterSt,    setFilterSt]    = useState('')
  const [showAddProd, setShowAddProd] = useState(false)
  const [detailData,  setDetailData]  = useState(null)
  const [loadDetail,  setLoadDetail]  = useState(false)

  const fetchList = useCallback(() => {
    setLoading(true)
    adminFlashSaleApi.list(filterSt ? { status: filterSt } : {})
      .then(res => setFlashSales(res.data))
      .catch(() => toast.error('Không thể tải danh sách Flash Sale!'))
      .finally(() => setLoading(false))
  }, [filterSt])

  useEffect(() => { fetchList() }, [fetchList])

  const openCreate = () => { setForm(emptyForm()); setSelected(null); setModal('create') }
  const openEdit   = (fs) => {
    setForm({
      name:             fs.name,
      discount_percent: fs.discount_percent,
      start_time:       toLocalInput(fs.start_time),
      end_time:         toLocalInput(fs.end_time),
      status:           fs.status,
    })
    setSelected(fs)
    setModal('edit')
  }

  const openDetail = async (fs) => {
    setSelected(fs)
    setModal('detail')
    setLoadDetail(true)
    try {
      const res = await adminFlashSaleApi.get(fs.id)
      setDetailData(res.data)
    } catch { toast.error('Không thể tải chi tiết!') }
    finally { setLoadDetail(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await adminFlashSaleApi.create(form)
        toast.success('Tạo Flash Sale thành công!')
      } else {
        await adminFlashSaleApi.update(selected.id, form)
        toast.success('Cập nhật thành công!')
      }
      setModal(null)
      fetchList()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach(v => toast.error(v[0]))
      else toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá Flash Sale này?')) return
    try {
      await adminFlashSaleApi.delete(id)
      toast.success('Đã xoá!')
      fetchList()
    } catch { toast.error('Xoá thất bại!') }
  }

  const handleToggle = async (fs) => {
    try {
      await adminFlashSaleApi.update(fs.id, { status: !fs.status })
      toast.success(fs.status ? 'Đã tắt Flash Sale!' : 'Đã bật Flash Sale!')
      fetchList()
      if (detailData?.id === fs.id) setDetailData(d => ({ ...d, status: !d.status }))
    } catch { toast.error('Cập nhật thất bại!') }
  }

  const handleRemoveProduct = async (productId) => {
    if (!confirm('Xoá sản phẩm này khỏi Flash Sale?')) return
    try {
      await adminFlashSaleApi.removeProduct(detailData.id, productId)
      toast.success('Đã xoá sản phẩm!')
      const res = await adminFlashSaleApi.get(detailData.id)
      setDetailData(res.data)
      fetchList()
    } catch { toast.error('Xoá thất bại!') }
  }

  const filterTabs = [
    { value: '',         label: 'Tất cả' },
    { value: 'active',   label: '🔴 Đang diễn ra' },
    { value: 'upcoming', label: '🟡 Sắp diễn ra' },
    { value: 'ended',    label: '⚫ Đã kết thúc' },
    { value: 'disabled', label: '⚪ Đã tắt' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Flash Sale</h1>
          <p className="page-subtitle">Chương trình giảm giá theo khung giờ</p>
        </div>
        <button className="btn btn-danger" onClick={openCreate}>
          <Zap size={16} /> Tạo Flash Sale
        </button>
      </div>

      {/* Filter tabs */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          {filterTabs.map(t => (
            <button key={t.value} onClick={() => setFilterSt(t.value)}
              className={`btn btn-sm ${filterSt === t.value ? 'btn-primary' : 'btn-secondary'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : flashSales.length === 0 ? (
        <div className="empty-state">
          <Zap size={48} className="empty-state-icon" />
          <p className="empty-state-text">Chưa có Flash Sale nào</p>
          <button className="btn btn-danger" onClick={openCreate} style={{ marginTop: 12 }}>
            <Plus size={16} /> Tạo ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {flashSales.map(fs => {
            const cfg = STATUS_CONFIG[fs.display_status] ?? STATUS_CONFIG.ended
            const discountedPrice = (price) => price * (1 - fs.discount_percent / 100)
            return (
              <div key={fs.id} className="card" style={{
                border: `1px solid ${fs.display_status === 'active' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Stripe decoration */}
                {fs.display_status === 'active' && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear',
                  }} />
                )}

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold" style={{ fontSize: '1rem' }}>{fs.name}</div>
                    <span className={`badge ${cfg.badge}`} style={{ marginTop: 4 }}>{cfg.label}</span>
                  </div>
                  <div style={{
                    fontSize: '2rem', fontWeight: 900,
                    color: '#ef4444', lineHeight: 1,
                    textShadow: '0 0 20px rgba(239,68,68,0.3)',
                  }}>
                    -{fs.discount_percent}%
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, fontSize: '0.8rem' }}>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    <span>Bắt đầu: <strong style={{ color: 'var(--text)' }}>{new Date(fs.start_time).toLocaleString('vi-VN')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    <span>Kết thúc: <strong style={{ color: 'var(--text)' }}>{new Date(fs.end_time).toLocaleString('vi-VN')}</strong></span>
                  </div>
                  {fs.display_status === 'active' && (
                    <div className="flex items-center gap-2">
                      <Zap size={13} color="#ef4444" />
                      <span style={{ color: 'var(--text-muted)' }}>Còn lại: <Countdown endTime={fs.end_time} /></span>
                    </div>
                  )}
                  <div style={{ color: 'var(--text-muted)' }}>
                    Sản phẩm: <strong style={{ color: 'var(--text)' }}>{fs.products_count ?? 0}</strong>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openDetail(fs)}>
                    <Package size={13} /> Sản phẩm
                  </button>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(fs)} title="Chỉnh sửa">
                    <Edit size={13} />
                  </button>
                  <button
                    className={`btn btn-sm btn-icon ${fs.status ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggle(fs)}
                    title={fs.status ? 'Tắt' : 'Bật'}>
                    <Zap size={13} />
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(fs.id)} title="Xoá">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {modal === 'create' ? '⚡ Tạo Flash Sale mới' : '✏️ Chỉnh sửa Flash Sale'}
              </h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Tên chương trình *</label>
                <input className="form-control" required placeholder="Flash Sale Hè 2026..."
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Mức giảm giá (%) *</label>
                <input className="form-control" type="number" min="1" max="99" required placeholder="50"
                  value={form.discount_percent}
                  onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} />
                {form.discount_percent && (
                  <p className="text-xs" style={{ marginTop: 4, color: '#ef4444' }}>
                    Sản phẩm 500.000đ → {fmt(500000 * (1 - form.discount_percent / 100))}
                  </p>
                )}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Bắt đầu *</label>
                  <input className="form-control" type="datetime-local" required
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kết thúc *</label>
                  <input className="form-control" type="datetime-local" required
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} />
                <span className="form-label" style={{ margin: 0 }}>Kích hoạt ngay</span>
              </label>
              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 4 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-danger" disabled={saving}>
                  {saving ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                  {saving ? 'Đang lưu...' : 'Lưu Flash Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal — Quản lý sản phẩm */}
      {modal === 'detail' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">⚡ {selected.name}</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Giảm {selected.discount_percent}% — {new Date(selected.start_time).toLocaleString('vi-VN')} → {new Date(selected.end_time).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-danger btn-sm" onClick={() => { setShowAddProd(true) }}>
                  <Plus size={14} /> Thêm sản phẩm
                </button>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
              </div>
            </div>

            {loadDetail ? (
              <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : !detailData?.products?.length ? (
              <div className="empty-state">
                <Package size={40} className="empty-state-icon" />
                <p className="empty-state-text">Chưa có sản phẩm nào trong Flash Sale</p>
                <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddProd(true)}>
                  <Plus size={14} /> Thêm sản phẩm
                </button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Giá gốc</th>
                      <th>Giá Flash Sale</th>
                      <th>Giảm</th>
                      <th style={{ width: 80 }}>Xoá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.products.map(p => {
                      const discPct = p.pivot?.discount_percent ?? detailData.discount_percent
                      const salePrice = p.price * (1 - discPct / 100)
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              {p.thumbnail
                                ? <img src={p.thumbnail} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                                : <div style={{ width: 36, height: 36, background: 'rgba(239,68,68,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} color="#ef4444" /></div>
                              }
                              <div>
                                <div className="font-semibold" style={{ fontSize: '0.85rem' }}>{p.name}</div>
                                <div className="text-xs text-muted">{p.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted" style={{ textDecoration: 'line-through', fontSize: '0.85rem' }}>{fmt(p.price)}</td>
                          <td className="font-bold" style={{ color: '#ef4444' }}>{fmt(salePrice)}</td>
                          <td><span className="badge badge-danger">-{discPct}%</span></td>
                          <td>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleRemoveProduct(p.id)}>
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal thêm sản phẩm */}
      {showAddProd && detailData && (
        <AddProductModal
          flashSaleId={detailData.id}
          existingIds={detailData.products?.map(p => p.id) ?? []}
          onClose={() => setShowAddProd(false)}
          onAdded={async () => {
            const res = await adminFlashSaleApi.get(detailData.id)
            setDetailData(res.data)
            fetchList()
          }}
        />
      )}
    </div>
  )
}
