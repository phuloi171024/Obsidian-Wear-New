import Header from "../components/Header";
import Footer from "../components/Footer";
import "./OrdersPage.css";
import "./ProfilePage.css";

import {
  FiUser,
  FiClipboard,
  FiLock,
  FiLogOut,
  FiEdit,
} from "react-icons/fi";

import { Link } from "react-router-dom";

export default function ProfilePage() {
  return (
    <>
      <Header />

      <div className="orders-page">

        <div className="account-layout">

          <div className="account-sidebar">

            <h2>Tài khoản của tôi</h2>

            <div className="user-info">
              <div className="avatar">P</div>

              <div>
                <h4>Phi Nguyễn</h4>
                <span>admin@obsidianwear.vn</span>
              </div>
            </div>

            <ul className="account-menu">

              <li className="active">
                <Link to="/profile">
                  <FiUser />
                  Thông tin cá nhân
                </Link>
              </li>

              <li>
                <Link to="/orders">
                  <FiClipboard />
                  Đơn hàng của tôi
                </Link>
              </li>

              <li>
                <FiLock />
                Đổi mật khẩu
              </li>

              <li className="logout">
                <FiLogOut />
                Đăng xuất
              </li>

            </ul>

          </div>

          <div className="profile-content">

            <div className="profile-header">
              <h2>
                <FiEdit />
                Thông tin cá nhân
              </h2>

              <span>* Thông tin bắt buộc</span>
            </div>

            <div className="profile-form">

              <div className="form-group">
                <label>Họ và tên *</label>
                <input value="Phi Nguyễn" />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input value="admin@obsidianwear.vn" />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input value="0123456789" />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input value="367/22 Tân Bình Trọng" />
              </div>

            </div>

            <div className="profile-btn">
              <button>Cập nhật thông tin</button>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
