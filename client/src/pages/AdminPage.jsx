import { useState } from "react";
import "./AdminPage.css";

// ---- Mock data — thay bằng API thật khi có backend ----
const stats = [
  { key: "products", label: "Tổng sản phẩm", value: "1,250", icon: "box" },
  { key: "members", label: "Tổng thành viên", value: "5,340", icon: "users" },
  { key: "categories", label: "Tổng danh mục", value: "15", icon: "tag" },
  { key: "orders", label: "Tổng đơn hàng", value: "890", icon: "cart" },
];

const revenueOrders = [
  { id: "OW15201", amount: "630.000 VND" },
  { id: "OW15202", amount: "499.000 VND" },
  { id: "OW15203", amount: "303.000 VND" },
  { id: "OW15204", amount: "735.000 VND" },
  { id: "OW15205", amount: "393.000 VND" },
];

const allOrders = [
  { id: "OW15201", status: "Đang giao", total: "630.000 VND" },
  { id: "OW15202", status: "Hủy đơn", total: "499.000 VND" },
  { id: "OW15203", status: "Chờ xác nhận", total: "303.000 VND" },
  { id: "OW15204", status: "Hủy đơn", total: "735.000 VND" },
  { id: "OW15205", status: "Đang giao", total: "393.000 VND" },
];

const newCustomers = [
  { id: "20110", username: "Tuan Nguyen" },
  { id: "20022", username: "Shormaynn" },
  { id: "20003", username: "Jamin" },
  { id: "20004", username: "Tuan Nguyen" },
  { id: "20005", username: "Tuan Nguyen" },
];

const categories = [
  { id: "DM01", name: "Áo", count: 320 },
  { id: "DM02", name: "Quần", count: 210 },
  { id: "DM03", name: "Giày", count: 180 },
  { id: "DM04", name: "Túi", count: 95 },
];

const products = [
  { id: "SP001", name: "Áo thun Obsidian Star", price: "350.000 VND", stock: 42 },
  { id: "SP002", name: "Quần jean slim fit", price: "520.000 VND", stock: 18 },
  { id: "SP003", name: "Giày thể thao Obsidian", price: "890.000 VND", stock: 7 },
  { id: "SP004", name: "Túi tote Obsidian", price: "270.000 VND", stock: 30 },
];

const members = [
  { id: "20110", username: "Tuan Nguyen", email: "tuan@example.com", joined: "12/01/2026" },
  { id: "20022", username: "Shormaynn", email: "shormaynn@example.com", joined: "15/01/2026" },
  { id: "20003", username: "Jamin", email: "jamin@example.com", joined: "20/01/2026" },
];

const comments = [
  { id: "BL01", user: "Tuan Nguyen", product: "Áo thun Obsidian Star", content: "Chất vải mát, form đẹp!" },
  { id: "BL02", user: "Jamin", product: "Giày thể thao Obsidian", content: "Giao hàng hơi chậm nhưng sản phẩm ổn." },
];

const navItems = [
  { key: "dashboard", label: "Bảng điều khiển", icon: "grid" },
  { key: "orders", label: "Quản lí đơn hàng", icon: "cart" },
  { key: "categories", label: "Quản lí danh mục", icon: "tag" },
  { key: "products", label: "Quản lí sản phẩm", icon: "box" },
  { key: "members", label: "Quản lí thành viên", icon: "users" },
  { key: "stats", label: "Thống kê", icon: "chart" },
  { key: "comments", label: "Quản lí bình luận", icon: "chat" },
];

const pageTitles = {
  dashboard: "Bảng điều khiển",
  orders: "Quản lí đơn hàng",
  categories: "Quản lí danh mục",
  products: "Quản lí sản phẩm",
  members: "Quản lí thành viên",
  stats: "Thống kê",
  comments: "Quản lí bình luận",
};

const statusClass = {
  "Đang giao": "status-shipping",
  "Hủy đơn": "status-cancelled",
  "Chờ xác nhận": "status-pending",
};

function Icon({ name }) {
  const paths = {
    box: "M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7M12 11v10",
    users: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM2 21a7 7 0 0114 0M16 8a3 3 0 110-6 3 3 0 010 6zm2 5a6.98 6.98 0 016 8",
    tag: "M20.6 12.6l-8.2-8.2a2 2 0 00-1.4-.6H5a2 2 0 00-2 2v6a2 2 0 00.6 1.4l8.2 8.2a2 2 0 002.8 0l6.4-6.4a2 2 0 000-2.8zM7 8h.01",
    cart: "M3 3h2l2.6 12.4A2 2 0 009.6 17H18a2 2 0 002-1.6L21.6 7H6M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z",
    grid: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
    chart: "M4 20V10m6 10V4m6 16v-7",
    chat: "M21 11.5a8.38 8.38 0 01-8.5 8.4 8.5 8.5 0 01-4-1L3 20l1.1-5.5a8.38 8.38 0 01-1-4A8.4 8.4 0 0111.5 2 8.4 8.4 0 0121 11.5z",
    search: "M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.35-4.35",
    bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
    plus: "M12 5v14M5 12h14",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

// ---- Từng section riêng cho mỗi mục menu ----

function DashboardSection() {
  return (
    <>
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div className="admin-stat-card" key={s.key}>
            <div className="admin-stat-icon">
              <Icon name={s.icon} />
            </div>
            <div>
              <p className="admin-stat-label">{s.label}</p>
              <p className="admin-stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panels-grid">
        <section className="admin-panel">
          <h2 className="admin-panel-title">Tổng doanh thu</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Doanh thu (VND)</th>
              </tr>
            </thead>
            <tbody>
              {revenueOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">Đơn hàng mới</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>
                    <span className={`admin-status ${statusClass[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">Khách hàng mới</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {newCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function OrdersSection() {
  return (
    <section className="admin-panel admin-panel-full">
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">Tất cả đơn hàng</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {allOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.total}</td>
              <td>
                <span className={`admin-status ${statusClass[o.status]}`}>{o.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="admin-panel admin-panel-full">
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">Danh mục sản phẩm</h2>
        <button className="admin-add-btn"><Icon name="plus" />Thêm danh mục</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã danh mục</th>
            <th>Tên danh mục</th>
            <th>Số sản phẩm</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProductsSection() {
  return (
    <section className="admin-panel admin-panel-full">
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">Danh sách sản phẩm</h2>
        <button className="admin-add-btn"><Icon name="plus" />Thêm sản phẩm</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã SP</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Tồn kho</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function MembersSection() {
  return (
    <section className="admin-panel admin-panel-full">
      <h2 className="admin-panel-title">Danh sách thành viên</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Ngày tham gia</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.username}</td>
              <td>{m.email}</td>
              <td>{m.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="admin-panel admin-panel-full">
      <h2 className="admin-panel-title">Thống kê</h2>
      <p className="admin-empty-text">
        Chưa có dữ liệu biểu đồ. Kết nối API thống kê doanh thu / đơn hàng theo thời gian để hiển thị ở đây.
      </p>
    </section>
  );
}

function CommentsSection() {
  return (
    <section className="admin-panel admin-panel-full">
      <h2 className="admin-panel-title">Bình luận sản phẩm</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Sản phẩm</th>
            <th>Nội dung</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id}>
              <td>{c.user}</td>
              <td>{c.product}</td>
              <td>{c.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const sectionByKey = {
  dashboard: DashboardSection,
  orders: OrdersSection,
  categories: CategoriesSection,
  products: ProductsSection,
  members: MembersSection,
  stats: StatsSection,
  comments: CommentsSection,
};

export default function AdminPage() {
  const [active, setActive] = useState("dashboard");
  const ActiveSection = sectionByKey[active];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-star">✦</span>
          <div className="admin-logo-text">
            <span className="admin-logo-main">OBSIDIAN</span>
            <span className="admin-logo-sub">WEAR ADMIN</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav-item ${active === item.key ? "is-active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className="admin-nav-icon">
                <Icon name={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search">
            <Icon name="search" />
            <input type="text" placeholder="Tìm kiếm sản phẩm, đơn hàng..." />
          </div>

          <div className="admin-topbar-right">
            <button className="admin-bell" aria-label="Thông báo">
              <Icon name="bell" />
              <span className="admin-bell-dot">1</span>
            </button>
            <div className="admin-account">
              <div className="admin-account-badge">A</div>
              <div className="admin-account-text">
                <span className="admin-account-label">Admin</span>
                <span className="admin-account-name">Tuan Nguyen</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <h1 className="admin-page-title">{pageTitles[active]}</h1>
          <ActiveSection />
        </main>
      </div>
    </div>
  );
}