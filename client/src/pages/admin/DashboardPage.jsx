import { useState, useEffect } from 'react'
import { dashboardApi } from '../../api'
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const STATUS_CONFIG = {
  pending:    { label: 'Chờ xử lý',  className: 'badge-warning', color: '#f59e0b' },
  processing: { label: 'Đang xử lý', className: 'badge-info',    color: '#3b82f6' },
  shipped:    { label: 'Đang giao',  className: 'badge-purple',  color: '#8b5cf6' },
  delivered:  { label: 'Đã giao',    className: 'badge-success', color: '#10b981' },
  cancelled:  { label: 'Đã huỷ',     className: 'badge-danger',  color: '#ef4444' },
}

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#12121e',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: '#9490b5', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#a78bfa', fontWeight: 700, fontSize: '0.9rem' }}>
            {formatter ? formatter(p.value) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-center">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang tải dữ liệu...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="empty-state">
      <Activity size={48} className="empty-state-icon" />
      <p>Không thể tải dữ liệu Dashboard.</p>
      <p style={{ fontSize: '0.8rem' }}>Vui lòng kiểm tra kết nối API.</p>
    </div>
  )

  const statCards = [
    {
      label: 'Doanh thu tháng này',
      value: fmt(data.revenue.this_month),
      sub: `Tháng trước: ${fmt(data.revenue.last_month)}`,
      growth: data.revenue.growth,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Tổng đơn hàng',
      value: data.orders.total,
      sub: `Chờ xử lý: ${data.orders.by_status?.pending ?? 0}`,
      icon: ShoppingBag,
      color: 'amber',
    },
    {
      label: 'Người dùng',
      value: data.users.total,
      sub: `Mới tháng này: +${data.users.new_this_month}`,
      icon: Users,
      color: 'green',
    },
    {
      label: 'Sản phẩm',
      value: data.products.total,
      sub: `Đang bán: ${data.products.active}`,
      icon: Package,
      color: 'blue',
    },
  ]

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${card.color}`}>
                <Icon size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-sub">{card.sub}</div>
                {card.growth !== undefined && (
                  <div className={`stat-growth ${card.growth >= 0 ? 'up' : 'down'}`}>
                    {card.growth >= 0
                      ? <ArrowUpRight size={13} />
                      : <ArrowDownRight size={13} />}
                    {Math.abs(card.growth)}% so với tháng trước
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold" style={{ fontSize: '0.95rem' }}>Doanh thu 7 ngày</h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>Tổng giá trị đơn hàng hoàn thành</p>
            </div>
            <span className="badge badge-purple">Triệu đồng</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenue_chart} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#524f6a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#524f6a', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip formatter={v => fmt(v)} />} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5}
                fill="url(#revGrad)" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2, stroke: '#12121e' }}
                activeDot={{ r: 6, fill: '#a78bfa', stroke: '#12121e', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold" style={{ fontSize: '0.95rem' }}>Đơn hàng 7 ngày</h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>Số đơn hàng theo ngày</p>
            </div>
            <span className="badge badge-success">Đơn/ngày</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.orders_chart} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#524f6a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#524f6a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip formatter={v => `${v} đơn`} />} />
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>
        {/* Order Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: '0.95rem' }}>Trạng thái đơn hàng</h3>
            <span className="info-tag">
              <ShoppingBag size={11} />
              {data.orders.total} tổng
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = data.orders.by_status?.[key] ?? 0
              const pct = data.orders.total > 0 ? (count / data.orders.total) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <span className={`badge ${cfg.className}`}>{cfg.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: cfg.color }}>{count}</span>
                      <span className="text-xs text-muted">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${cfg.color}aa, ${cfg.color})`,
                      borderRadius: 99,
                      transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: `0 0 8px ${cfg.color}66`,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: '0.95rem' }}>Top sản phẩm bán chạy</h3>
            <span className="badge badge-warning">🏆 Top 5</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Sản phẩm</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{
                        width: 26, height: 26,
                        background: i === 0 ? 'rgba(245,158,11,0.2)' : i === 1 ? 'rgba(156,163,175,0.15)' : i === 2 ? 'rgba(180,130,90,0.15)' : 'rgba(255,255,255,0.05)',
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b4825a' : 'var(--text-muted)',
                        borderRadius: 6,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800,
                        border: i === 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold truncate" style={{ maxWidth: 200 }}>{p.name}</div>
                      <div className="text-xs text-muted">{fmt(p.price)}</div>
                    </td>
                    <td><span className="badge badge-success">{p.total_sold}</span></td>
                    <td className="font-bold text-accent">{fmt(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
