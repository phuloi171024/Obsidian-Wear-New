import { NavLink, Outlet } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiGrid,
  FiUsers,
  FiBarChart2,
  FiMessageCircle,
  FiSearch,
  FiBell,
  FiChevronDown
} from "react-icons/fi";

import "./Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">

      {/* Sidebar */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <img src="/src/public/images/logo.png" alt="Obsidian Wear" />

          <div className="admin-logo-text">
            <h2>OBSIDIAN WEAR</h2>
          </div>

        </div>

        <div className="admin-menu">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiHome />
            <span>Bảng điều khiển</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiShoppingCart />
            <span>Quản lí đơn hàng</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiBox />
            <span>Quản lí sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiGrid />
            <span>Quản lí danh mục</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiUsers />
            <span>Quản lí thành viên</span>
          </NavLink>

          <NavLink
            to="/admin/statistics"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiBarChart2 />
            <span>Thống kê</span>
          </NavLink>

          <NavLink
            to="/admin/comments"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiMessageCircle />
            <span>Quản lí bình luận</span>
          </NavLink>

        </div>

      </aside>

      {/* Main */}

      <div className="admin-main">

        <header className="admin-topbar">

          <div className="admin-search-box">

            <FiSearch />

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            />

          </div>

          <div className="admin-right">

            <div className="admin-bell">

              <FiBell />

              <span>1</span>

            </div>

            <div className="admin-account">

              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Admin"
              />

              <div>

                <h4>Admin</h4>

                <h4>Phi Nguyen</h4>

              </div>

              <FiChevronDown />

            </div>

          </div>

        </header>

        <main className="admin-page">

          <Outlet />

        </main>

      </div>

    </div>
  );
}