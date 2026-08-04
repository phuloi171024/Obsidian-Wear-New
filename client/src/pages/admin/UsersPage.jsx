import { useState, useEffect, useCallback } from 'react'
import { adminUserApi } from '../../api'
import { Search, Users, Lock, Unlock, Shield, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

// Cấu hình role
const ROLE_CONFIG = {
  user:             { label: 'Khách hàng',       badge: 'badge-muted',   color: '#6b7280' },
  admin:            { label: 'Admin',             badge: 'badge-purple',  color: '#8b5cf6' },
}

export default function UsersPage() {
  const [users,       setUsers]       = useState([])
  const [meta,        setMeta]        = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [role,        setRole]        = useState('')
  const [page,        setPage]        = useState(1)
  const [roleModal,   setRoleModal]   = useState(null) // user object đang đổi role
  const [newRole,     setNewRole]     = useState('')
  const [savingRole,  setSavingRole]  = useState(false)

  const fetch = useCallback(() => {
    setLoading(true)
    adminUserApi.list({ search, role, page, per_page: 15 })
      .then(res => {
        setUsers(res.data.data)
        setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total })
      })
      .catch(() => toast.error('Không thể tải danh sách user!'))
      .finally(() => setLoading(false))
  }, [search, role, page])

  useEffect(() => { fetch() }, [fetch])

  // Khoá / Mở khoá tài khoản
  const handleToggleStatus = async (id) => {
    try {
      const res = await adminUserApi.toggleStatus(id)
      toast.success(res.data.message)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: !u.status } : u))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại!')
    }
  }

  // Mở modal đổi role
  const openRoleModal = (u) => {
    setRoleModal(u)
    setNewRole(u.role)
  }

  // Lưu role mới
  const handleSaveRole = async () => {
    if (!roleModal || newRole === roleModal.role) { setRoleModal(null); return }
    setSavingRole(true)
    try {
      await adminUserApi.update(roleModal.id, { role: newRole })
      toast.success('Cập nhật quyền thành công!')
      setUsers(prev => prev.map(u => u.id === roleModal.id ? { ...u, role: newRole } : u))
      setRoleModal(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setSavingRole(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Người dùng</h1>
          <p className="page-subtitle">Tổng cộng {meta.total} tài khoản</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-3">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input className="form-control" placeholder="Tìm theo tên, email, SĐT..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {[
            { value: '',      label: 'Tất cả' },
            { value: 'user',  label: 'Khách hàng' },
            { value: 'admin', label: 'Admin' },
          ].map(r => (
            <button key={r.value} onClick={() => { setRole(r.value); setPage(1) }}
              className={`btn btn-sm ${role === r.value ? 'btn-primary' : 'btn-secondary'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Đơn hàng</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <Users size={40} className="empty-state-icon" />
                  <p className="empty-state-text">Không có người dùng nào</p>
                </div>
              </td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 34, height: 34,
                      background: u.role === 'admin'
                        ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                        : 'linear-gradient(135deg,var(--accent),var(--accent-dark))',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                    }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="text-muted text-sm">{u.phone ?? '—'}</td>
                <td>
                  <span className={`badge ${ROLE_CONFIG[u.role]?.badge ?? 'badge-muted'}`}>
                    {ROLE_CONFIG[u.role]?.label ?? u.role}
                  </span>
                </td>
                <td><span className="badge badge-info">{u.orders_count ?? 0} đơn</span></td>
                <td>
                  <span className={`badge ${u.status ? 'badge-success' : 'badge-danger'}`}>
                    {u.status ? 'Hoạt động' : 'Đã khoá'}
                  </span>
                </td>
                <td className="text-muted text-sm">
                  {new Date(u.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div className="flex gap-2">
                    {/* Đổi quyền */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openRoleModal(u)}
                      title="Phân quyền"
                      style={{ gap: 4, fontSize: '0.75rem' }}
                    >
                      <Shield size={13} /> Quyền
                    </button>
                    {/* Khoá / Mở khoá (không áp dụng cho admin) */}
                    {u.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.status ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(u.id)}
                        title={u.status ? 'Khoá tài khoản' : 'Mở khoá'}
                      >
                        {u.status ? <><Lock size={13} /> Khoá</> : <><Unlock size={13} /> Mở khoá</>}
                      </button>
                    )}
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

      {/* Modal Phân quyền */}
      {roleModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRoleModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">🛡️ Phân quyền người dùng</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setRoleModal(null)}>✕</button>
            </div>

            {/* Thông tin user */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 10, border: '1px solid var(--border)',
              marginBottom: 20,
            }}>
              <div style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0,
              }}>
                {roleModal.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{roleModal.name}</div>
                <div className="text-xs text-muted">{roleModal.email}</div>
              </div>
              <span className={`badge ${ROLE_CONFIG[roleModal.role]?.badge ?? 'badge-muted'}`} style={{ marginLeft: 'auto' }}>
                Hiện: {ROLE_CONFIG[roleModal.role]?.label ?? roleModal.role}
              </span>
            </div>

            {/* Chọn role mới */}
            <div className="form-group">
              <label className="form-label">Chọn vai trò mới</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${newRole === key ? cfg.color + '66' : 'var(--border)'}`,
                      background: newRole === key ? cfg.color + '11' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input type="radio" name="role" value={key}
                      checked={newRole === key}
                      onChange={() => setNewRole(key)}
                      style={{ accentColor: cfg.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: newRole === key ? cfg.color : 'inherit' }}>
                        {cfg.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {key === 'user'  && 'Chỉ xem và mua hàng'}
                        {key === 'admin' && 'Toàn quyền quản trị hệ thống'}
                      </div>
                    </div>
                    <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setRoleModal(null)}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSaveRole} disabled={savingRole || newRole === roleModal.role}>
                {savingRole ? <><Loader size={14} className="animate-spin" /> Đang lưu...</> : '💾 Lưu phân quyền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
