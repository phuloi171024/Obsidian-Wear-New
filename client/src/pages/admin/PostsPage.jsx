import { useState, useEffect, useCallback, useRef } from 'react'
import { adminPostApi } from '../../api'
import {
  Plus, Edit, Trash2, FileText, Loader, Search,
  Globe, FileEdit, Eye, Calendar, User, Tag,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Danh mục bài viết gợi ý
const POST_CATEGORIES = [
  'Hướng dẫn chọn size',
  'Xu hướng thời trang',
  'Chăm sóc trang phục',
  'Review sản phẩm',
  'Tin tức thương hiệu',
  'Khuyến mãi & Ưu đãi',
]

const STATUS_CONFIG = {
  published: { label: 'Đã đăng',  badge: 'badge-success', icon: Globe },
  draft:     { label: 'Nháp',     badge: 'badge-muted',   icon: FileEdit },
}

function emptyForm() {
  return { title: '', content: '', thumbnail: '', excerpt: '', category: '', status: 'draft' }
}

// ── Rich Text Toolbar ─────────────────────────────────────────────────────
function SimpleEditor({ value, onChange }) {
  const ref = useRef(null)

  const insert = (before, after = '') => {
    const ta = ref.current
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = value.slice(start, end)
    const newVal = value.slice(0, start) + before + sel + after + value.slice(end)
    onChange(newVal)
    setTimeout(() => {
      ta.selectionStart = start + before.length
      ta.selectionEnd   = start + before.length + sel.length
      ta.focus()
    }, 0)
  }

  const tools = [
    { label: 'B',   style: { fontWeight: 900 }, action: () => insert('**', '**') },
    { label: 'I',   style: { fontStyle: 'italic' }, action: () => insert('_', '_') },
    { label: 'H2',  style: { fontWeight: 700, fontSize: '0.8rem' }, action: () => insert('\n## ') },
    { label: 'H3',  style: { fontWeight: 700, fontSize: '0.8rem' }, action: () => insert('\n### ') },
    { label: '• ',  style: {}, action: () => insert('\n- ') },
    { label: '1.',  style: {}, action: () => insert('\n1. ') },
    { label: '---', style: { fontSize: '0.7rem', letterSpacing: 1 }, action: () => insert('\n---\n') },
  ]

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 10px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {tools.map((t, i) => (
          <button key={i} type="button" onClick={t.action}
            style={{
              ...t.style,
              padding: '3px 9px', borderRadius: 6, fontSize: '0.8rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              color: 'var(--text)', cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          Hỗ trợ Markdown
        </span>
      </div>
      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', minHeight: 260, padding: '14px 16px',
          background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.7,
          fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
        }}
        placeholder="Viết nội dung bài viết tại đây...
&#10;Hỗ trợ Markdown:
## Tiêu đề 2
**In đậm**, _in nghiêng_
- Danh sách"
      />
    </div>
  )
}

// ── Main PostsPage ────────────────────────────────────────────────────────
export default function PostsPage() {
  const [posts,    setPosts]    = useState([])
  const [meta,     setMeta]     = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null) // null | 'create' | 'edit' | 'preview'
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState(emptyForm())
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [category, setCategory] = useState('')
  const [page,     setPage]     = useState(1)

  const fetchPosts = useCallback(() => {
    setLoading(true)
    adminPostApi.list({ search, status, category, page, per_page: 12 })
      .then(res => {
        setPosts(res.data.data)
        setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total })
      })
      .catch(() => toast.error('Không thể tải bài viết!'))
      .finally(() => setLoading(false))
  }, [search, status, category, page])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const openCreate = () => { setForm(emptyForm()); setSelected(null); setModal('create') }
  const openEdit   = (p) => {
    setForm({
      title: p.title, content: p.content ?? '', thumbnail: p.thumbnail ?? '',
      excerpt: p.excerpt ?? '', category: p.category ?? '', status: p.status,
    })
    setSelected(p)
    setModal('edit')
  }
  const openPreview = (p) => { setSelected(p); setModal('preview') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await adminPostApi.create(form)
        toast.success('Tạo bài viết thành công!')
      } else {
        await adminPostApi.update(selected.id, form)
        toast.success('Cập nhật thành công!')
      }
      setModal(null)
      fetchPosts()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach(v => toast.error(v[0]))
      else toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xoá bài viết này?')) return
    try { await adminPostApi.delete(id); toast.success('Đã xoá!'); fetchPosts() }
    catch { toast.error('Xoá thất bại!') }
  }

  const handlePublish = async (p) => {
    try {
      if (p.status === 'published') {
        await adminPostApi.draft(p.id)
        toast.success('Đã chuyển về nháp!')
      } else {
        await adminPostApi.publish(p.id)
        toast.success('Đã đăng bài!')
      }
      fetchPosts()
    } catch { toast.error('Thao tác thất bại!') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Blog & Bài viết</h1>
          <p className="page-subtitle">Tổng cộng {meta.total} bài viết</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Viết bài mới
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input className="form-control" placeholder="Tìm theo tiêu đề..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {[
            { value: '',          label: 'Tất cả' },
            { value: 'published', label: '🌐 Đã đăng' },
            { value: 'draft',     label: '📝 Nháp' },
          ].map(s => (
            <button key={s.value} onClick={() => { setStatus(s.value); setPage(1) }}
              className={`btn btn-sm ${status === s.value ? 'btn-primary' : 'btn-secondary'}`}>
              {s.label}
            </button>
          ))}
          <select className="form-control" style={{ width: 190 }}
            value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
            <option value="">Tất cả danh mục</option>
            {POST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-state-icon" />
          <p className="empty-state-text">Chưa có bài viết nào</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={openCreate}>
            <Plus size={14} /> Viết bài đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {posts.map(p => {
            const cfg = STATUS_CONFIG[p.status]
            const Icon = cfg.icon
            return (
              <div key={p.id} className="card" style={{
                display: 'flex', flexDirection: 'column', gap: 0,
                border: `1px solid ${p.status === 'published' ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                overflow: 'hidden', padding: 0,
              }}>
                {/* Thumbnail */}
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.title}
                    style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: 120,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={40} color="rgba(139,92,246,0.4)" />
                  </div>
                )}

                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Status + Category */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${cfg.badge}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    {p.category && (
                      <span className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={11} /> {p.category}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                    {p.title}
                  </h3>

                  {/* Excerpt */}
                  {p.excerpt && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.excerpt}
                    </p>
                  )}

                  {/* Meta info */}
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={11} /> {p.author?.name ?? 'Admin'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      {p.status === 'published' && p.published_at
                        ? new Date(p.published_at).toLocaleDateString('vi-VN')
                        : new Date(p.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2" style={{ marginTop: 8 }}>
                    <button
                      className={`btn btn-sm ${p.status === 'published' ? 'btn-secondary' : 'btn-success'}`}
                      style={{ flex: 1 }}
                      onClick={() => handlePublish(p)}>
                      {p.status === 'published'
                        ? <><FileEdit size={13} /> Về nháp</>
                        : <><Globe size={13} /> Đăng bài</>}
                    </button>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openPreview(p)} title="Xem trước">
                      <Eye size={13} />
                    </button>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(p)} title="Chỉnh sửa">
                      <Edit size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p.id)} title="Xoá">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="pagination" style={{ marginTop: 20 }}>
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 780, width: '95vw' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modal === 'create' ? '✍️ Viết bài mới' : '✏️ Chỉnh sửa bài viết'}
              </h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Tiêu đề */}
                <div className="form-group">
                  <label className="form-label">Tiêu đề bài viết *</label>
                  <input className="form-control" required
                    placeholder="Cách chọn size giày chạy bộ phù hợp..."
                    style={{ fontSize: '1rem', fontWeight: 600 }}
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                {/* Danh mục + Trạng thái */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Danh mục</label>
                    <select className="form-control"
                      value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Không phân loại</option>
                      {POST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-control"
                      value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="draft">📝 Lưu nháp</option>
                      <option value="published">🌐 Đăng ngay</option>
                    </select>
                  </div>
                </div>

                {/* Ảnh bìa */}
                <div className="form-group">
                  <label className="form-label">Ảnh bìa (URL)</label>
                  <input className="form-control" placeholder="https://..."
                    value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} />
                  {form.thumbnail && (
                    <img src={form.thumbnail} alt="preview"
                      style={{ marginTop: 8, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                </div>

                {/* Tóm tắt */}
                <div className="form-group">
                  <label className="form-label">Tóm tắt ngắn</label>
                  <textarea className="form-control" rows={2}
                    placeholder="Mô tả ngắn gọn về bài viết (hiển thị trên trang danh sách)..."
                    value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
                </div>

                {/* Nội dung */}
                <div className="form-group">
                  <label className="form-label">Nội dung *</label>
                  <SimpleEditor
                    value={form.content}
                    onChange={val => setForm(f => ({ ...f, content: val }))}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-secondary" disabled={saving}
                  onClick={() => setForm(f => ({ ...f, status: 'draft' }))}>
                  {saving ? <Loader size={14} className="animate-spin" /> : <FileEdit size={14} />}
                  Lưu nháp
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}
                  onClick={() => setForm(f => ({ ...f, status: 'published' }))}>
                  {saving ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
                  {saving ? 'Đang lưu...' : 'Đăng bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {modal === 'preview' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 720, width: '95vw' }}>
            <div className="modal-header">
              <h2 className="modal-title">👁️ Xem trước bài viết</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            {selected.thumbnail && (
              <img src={selected.thumbnail} alt={selected.title}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 16, border: '1px solid var(--border)' }} />
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className={`badge ${STATUS_CONFIG[selected.status].badge}`}>{STATUS_CONFIG[selected.status].label}</span>
              {selected.category && <span className="badge badge-muted"><Tag size={11} /> {selected.category}</span>}
              <span className="badge badge-muted"><User size={11} /> {selected.author?.name ?? 'Admin'}</span>
              {selected.published_at && (
                <span className="badge badge-muted"><Calendar size={11} /> {new Date(selected.published_at).toLocaleDateString('vi-VN')}</span>
              )}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{selected.title}</h2>
            {selected.excerpt && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                {selected.excerpt}
              </p>
            )}
            <div style={{
              fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text)',
              whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto',
              padding: '0 4px',
            }}>
              {selected.content || <em style={{ color: 'var(--text-muted)' }}>Không có nội dung</em>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
