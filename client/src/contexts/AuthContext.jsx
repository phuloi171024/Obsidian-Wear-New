import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(localStorage.getItem('admin_token'))
  const [loading, setLoading] = useState(true)

  // Lấy lại profile khi có token
  useEffect(() => {
    if (token) {
      authApi.profile()
        .then(res => {
          if (res.data.role === 'admin') {
            setUser(res.data)
          } else {
            logout()
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { access_token, user: u } = res.data

    if (u.role !== 'admin') {
      throw new Error('Tài khoản không có quyền admin!')
    }

    localStorage.setItem('admin_token', access_token)
    localStorage.setItem('admin_user', JSON.stringify(u))
    setToken(access_token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    if (token) authApi.logout().catch(() => {})
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken(null)
    setUser(null)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
