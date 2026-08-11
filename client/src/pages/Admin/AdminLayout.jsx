import { NavLink, Outlet } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiGrid,
  FiUsers,
  FiBarChart2,
  FiMessageCircle,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiPackage,
  FiTag
} from "react-icons/fi";

import "./Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        {/* LOGO */}

        <div className="admin-logo">

          <img
            src="/src/public/images/logo.png"
            alt="Obsidian Wear"
          />

          <div className="admin-logo-text">
            <h2>OBSIDIAN WEAR</h2>
          </div>

        </div>

        {/* MENU */}

        <div className="admin-menu">

          {/* BẢNG ĐIỀU KHIỂN */}

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


          {/* QUẢN LÍ ĐƠN HÀNG */}

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiShoppingCart />
            <span>Quản lí đơn hàng</span>
          </NavLink>


          {/* =================
              QUẢN LÍ SẢN PHẨM
             ================= */}

          <div className="admin-menu-dropdown">

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                isActive ? "active admin-menu-item" : "admin-menu-item"
              }
            >
              <FiPackage />
              <span>Quản lí sản phẩm</span>
            </NavLink>


            {/* SUB MENU */}

            <div className="admin-submenu">

              <NavLink
                to="/admin/products/variants"
                className={({ isActive }) =>
                  isActive ? "active admin-submenu-item" : "admin-submenu-item"
                }
              >
                <span>Biến thể</span>
              </NavLink>

            </div>

          </div>


          {/* QUẢN LÍ DANH MỤC */}

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiGrid />
            <span>Quản lí danh mục</span>
          </NavLink>


          {/* QUẢN LÍ THÀNH VIÊN */}

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiUsers />
            <span>Quản lí thành viên</span>
          </NavLink>


          {/* THỐNG KÊ */}

          <NavLink
            to="/admin/statistics"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiBarChart2 />
            <span>Thống kê</span>
          </NavLink>


          {/* QUẢN LÍ BÌNH LUẬN */}

          <NavLink
            to="/admin/comments"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <FiMessageCircle />
            <span>Quản lí bình luận</span>
          </NavLink>


          {/* QUẢN LÍ MÃ GIẢM GIÁ */}

<NavLink
  to="/admin/discount-codes"
  className={({ isActive }) =>
    isActive ? "active" : ""
  }
>
  <FiTag />
  <span>Quản lí mã giảm giá</span>
</NavLink>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <div className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          {/* SEARCH */}

          <div className="admin-search-box">

            <FiSearch />

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            />

          </div>


          {/* RIGHT */}

          <div className="admin-right">

            {/* NOTIFICATION */}

            <div className="admin-bell">

              <FiBell />

              <span>1</span>

            </div>


            {/* ACCOUNT */}

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


        {/* PAGE CONTENT */}

        <main className="admin-page">

          <Outlet />

        </main>

      </div>

    </div>
  );
}