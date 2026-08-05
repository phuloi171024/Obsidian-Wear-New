import { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiLock,
  FiUnlock,
} from "react-icons/fi";

const initialUsers = [
  {
    id: 20110,
    avatar: "https://i.pravatar.cc/40?img=1",
    username: "Tuan Nguyen",
    email: "tuan.nguyen@email.com",
    phone: "0901234567",
    date: "15/01/2026",
    orders: 25,
    spending: "15,000,000",
    status: "Hoạt động",
    rank: "Vàng",
  },
  {
    id: 20022,
    avatar: "https://i.pravatar.cc/40?img=2",
    username: "Shormayn",
    email: "shormayn@email.com",
    phone: "0907654321",
    date: "10/02/2026",
    orders: 12,
    spending: "7,500,000",
    status: "Hoạt động",
    rank: "Bạc",
  },
  {
    id: 20003,
    avatar: "https://i.pravatar.cc/40?img=3",
    username: "Jamin",
    email: "jamin@email.com",
    phone: "0987654321",
    date: "05/01/2026",
    orders: 5,
    spending: "3,000,000",
    status: "Bị khóa",
    rank: "Đồng",
  },
  {
    id: 20004,
    avatar: "https://i.pravatar.cc/40?img=4",
    username: "Another Tuan",
    email: "another.tuan@email.com",
    phone: "0911223344",
    date: "20/01/2026",
    orders: 1,
    spending: "500,000",
    status: "Hoạt động",
    rank: "Mới",
  },
];

export default function Users() {
  const [search, setSearch] = useState("");

  const users = initialUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">

      <div className="page-header">

        <h2>Quản lí thành viên</h2>

        <button className="add-btn">
          <FiPlus />
          Thêm thành viên mới
        </button>

      </div>

      <div className="toolbar">

        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm thành viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      <div className="table-card">

        <table className="admin-table">

          <thead>

            <tr>
              <th>ID</th>
              <th>Avatar & Username</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày đăng ký</th>
              <th>Tổng đơn hàng</th>
              <th>Tổng chi tiêu(VND)</th>
              <th>Trạng thái</th>
              <th>Phân hạng</th>
              <th>Thao tác</th>
            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr key={user.id}>

                <td>{user.id}</td>

                <td>
                  <div className="user-info">

                    <img src={user.avatar} alt="" />

                    <span>{user.username}</span>

                  </div>
                </td>

                <td>{user.email}</td>

                <td>{user.phone}</td>

                <td>{user.date}</td>

                <td>{user.orders}</td>

                <td>{user.spending} VNĐ</td>

                <td>

                  <span
                    className={
                      user.status === "Hoạt động"
                        ? "status active"
                        : "status lock"
                    }
                  >
                    {user.status}
                  </span>

                </td>

                <td>

                  <span className={`rank ${user.rank.toLowerCase()}`}>
                    {user.rank}
                  </span>

                </td>

                <td>

                  <div className="action-btns">

                    <button className="view-btn">
                      <FiEye />
                    </button>

                    {user.status === "Hoạt động" ? (
                      <button className="lock-btn">
                        <FiLock />
                      </button>
                    ) : (
                      <button className="unlock-btn">
                        <FiUnlock />
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="pagination">

        <button>{"<"}</button>

        <button className="active">1</button>

        <button>{">"}</button>

      </div>

    </div>
  );
}