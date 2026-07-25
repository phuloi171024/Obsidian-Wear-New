import { useState, useEffect, useCallback } from 'react'
import { adminUserApi } from '../../api'
import { Search, Users, Lock, Unlock, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users,   setUsers]   = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [role,    setRole]    = useState('')
  const [page,    setPage]    = useState(1)

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

  const handleToggleStatus = async (id) => {
    try {
      const res = await adminUserApi.toggleStatus(id)
      toast.success(res.data.message)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: !u.status } : u))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại!')
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

      <div className="card mb-4" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-3">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input className="form-control" placeholder="Tìm theo tên, email, SĐT..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {['', 'user', 'admin'].map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1) }}
              className={`btn btn-sm ${role === r ? 'btn-primary' : 'btn-secondary'}`}>
              {r === '' ? 'Tất cả' : r === 'admin' ? 'Admin' : 'User'}
            </button>
          ))}
        </div>
      </div>

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
                      width: 34, height: 34, background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))',
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
                  <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-muted'}`}>
                    {u.role === 'admin' ? 'Admin' : 'User'}
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
                  {u.role !== 'admin' && (
                    <button
                      className={`btn btn-sm ${u.status ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(u.id)}
                      title={u.status ? 'Khoá tài khoản' : 'Mở khoá'}
                    >
                      {u.status ? <><Lock size={13} /> Khoá</> : <><Unlock size={13} /> Mở khoá</>}
                    </button>
                  )}
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
