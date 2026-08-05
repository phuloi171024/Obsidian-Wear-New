import { useState } from "react";
import {
  FiSearch,
  FiCheck,
  FiEyeOff,
  FiFlag,
  FiMessageCircle,
  FiMessageSquare,
  FiHelpCircle,
  FiStar,
} from "react-icons/fi";

const recentComments = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/40?img=1",
    user: "Tuan Nguyen",
    product: "Nike Air Max 270",
    content: "Nội dung còn rất tốt...",
    time: "6 phút",
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/40?img=2",
    user: "Shormaynn",
    product: "Áo Hoodie",
    content: "Nội dung giày tạm ổn...",
    time: "5 phút",
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/40?img=3",
    user: "Jamin",
    product: "Áo Polo",
    content: "Nội dung nói ngắn...",
    time: "4 phút",
  },
  {
    id: 4,
    avatar: "https://i.pravatar.cc/40?img=4",
    user: "Tuan Nguyen",
    product: "Quần Jean",
    content: "Nội dung con anh...",
    time: "4 phút",
  },
  {
    id: 5,
    avatar: "https://i.pravatar.cc/40?img=5",
    user: "Tuan Nguyen",
    product: "Áo Thun",
    content: "Nội dung nói con...",
    time: "4 phút",
  },
];

const pendingComments = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/40?img=6",
    user: "Tuan Nguyen",
    product: "Nike Air Max 270",
    content: "Nội dung còn tốt...",
    time: "02/01",
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/40?img=7",
    user: "Shormaynn",
    product: "Áo Hoodie",
    content: "Nội dung giày...",
    time: "06/01",
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/40?img=8",
    user: "Jamin",
    product: "Áo Polo",
    content: "Nội dung nói...",
    time: "03/01",
  },
  {
    id: 4,
    avatar: "https://i.pravatar.cc/40?img=9",
    user: "Shormaynn",
    product: "Quần Jean",
    content: "Nội dung con...",
    time: "03/01",
  },
  {
    id: 5,
    avatar: "https://i.pravatar.cc/40?img=10",
    user: "Jamin",
    product: "Áo Thun",
    content: "Nội dung mới...",
    time: "21/01",
  },
];

const newUsers = [
  {
    id: 20110,
    avatar: "https://i.pravatar.cc/40?img=11",
    username: "Tuan Nguyen",
  },
  {
    id: 20022,
    avatar: "https://i.pravatar.cc/40?img=12",
    username: "Shormaynn",
  },
  {
    id: 20003,
    avatar: "https://i.pravatar.cc/40?img=13",
    username: "Jamin",
  },
  {
    id: 20004,
    avatar: "https://i.pravatar.cc/40?img=14",
    username: "Tuan Nguyen",
  },
  {
    id: 20005,
    avatar: "https://i.pravatar.cc/40?img=15",
    username: "Nguyen Phi",
  },
];

export default function Comments() {
  const [keyword, setKeyword] = useState("");

  return (
    <div className="comments-page">

      <div className="comments-header">

        <div className="comments-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm kiếm bình luận..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

      </div>

      <div className="comment-cards">

  <div className="comment-card">
    <div className="card-content">
      <span>Tổng bình luận</span>
      <h2>12,500</h2>
    </div>

    <FiMessageCircle className="card-icon" />
  </div>

  <div className="comment-card">
    <div className="card-content">
      <span>Bình luận mới hôm nay</span>
      <h2>85</h2>
    </div>

    <FiMessageSquare className="card-icon" />
  </div>

  <div className="comment-card">
    <div className="card-content">
      <span>Chờ duyệt</span>
      <h2>42</h2>
    </div>

    <FiHelpCircle className="card-icon" />
  </div>

  <div className="comment-card">
    <div className="card-content">
      <span>Sản phẩm nhiều bình luận nhất</span>
      <h3>Nike Air Max 270</h3>
      <p>150 BL</p>
    </div>

    <FiStar className="card-icon" />
  </div>

</div>
      <div className="comment-content">

        <div className="comment-table">

          <div className="table-title">
            <h3>Bình luận gần đây</h3>

            <button>
              Duyệt hàng loạt
            </button>

          </div>

          <table>

            <thead>

              <tr>
                <th>User</th>
                <th>Tên sản phẩm</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
              </tr>

            </thead>

            <tbody>

              {recentComments.map((item) => (

                <tr key={item.id}>

                  <td className="user-cell">
                    <img src={item.avatar} alt="" />
                    {item.user}
                  </td>

                  <td>{item.product}</td>

                  <td>{item.content}</td>

                  <td>{item.time}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="comment-table">

          <div className="table-title">

            <h3>Bình luận chưa duyệt</h3>

            <button>
              <FiFlag />
              Báo cáo bình luận
            </button>

          </div>

          <table>

            <thead>

              <tr>
                <th>User</th>
                <th>Tên sản phẩm</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>

            </thead>

            <tbody>

              {pendingComments.map((item) => (

                <tr key={item.id}>

                  <td className="user-cell">
                    <img src={item.avatar} alt="" />
                    {item.user}
                  </td>

                  <td>{item.product}</td>

                  <td>{item.content}</td>

                  <td>{item.time}</td>

                  <td>

                    <button className="approve-btn">
                      <FiCheck />
                      Duyệt
                    </button>

                    <button className="hide-btn">
                      <FiEyeOff />
                      Ẩn
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="user-table">

          <h3>Khách hàng mới</h3>

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Username</th>
              </tr>

            </thead>

            <tbody>

              {newUsers.map((item) => (

                <tr key={item.id}>

                  <td>{item.id}</td>

                  <td className="user-cell">
                    <img src={item.avatar} alt="" />
                    {item.username}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}