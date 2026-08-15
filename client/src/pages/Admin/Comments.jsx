import { useState, useEffect } from "react";
import {
  FiSearch,
  FiCheck,
  FiEyeOff,
  FiFlag,
  FiMessageCircle,
  FiMessageSquare,
  FiHelpCircle,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function Comments() {
  const [keyword, setKeyword] = useState("");
  const [recentComments, setRecentComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    topProduct: "Đang cập nhật",
    topCount: 0
  });
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterReported, setFilterReported] = useState(false);

  // ================= 1. GỌI API LẤY DỮ LIỆU THẬT =================
  const fetchCommentsData = async (isInitial = false) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      if (isInitial) setInitialLoading(true);
      const headers = {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const [reviewsRes, usersRes] = await Promise.all([
        fetch("http://localhost:8000/api/admin/reviews?per_page=50", { headers }),
        fetch("http://localhost:8000/api/admin/users?per_page=5", { headers })
      ]);

      if (reviewsRes.ok) {
        const reviewData = await reviewsRes.json();
        const allReviews = reviewData.data || reviewData || [];

        const formattedReviews = allReviews.map(item => ({
          id: item.id,
          avatar: `https://i.pravatar.cc/40?img=${item.user_id || 1}`,
          user: item.user?.name || "Khách hàng",
          product: item.product?.name || `Sản phẩm #${item.product_id}`,
          content: item.comment,
          status: item.status || 'pending',
          report_count: item.report_count || 0,
          time: new Date(item.created_at).toLocaleDateString("vi-VN")
        }));

        const pending = formattedReviews.filter(r => r.status === 'hidden' || r.status === 'pending');
        const recent = formattedReviews.filter(r => r.status === 'approved');

        setPendingComments(pending);
        setRecentComments(recent);

        setStats({
          total: allReviews.length,
          today: allReviews.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length,
          pending: pending.length,
          topProduct: allReviews.length > 0 ? (allReviews[0].product?.name || "Sản phẩm nổi bật") : "Chưa có",
          topCount: allReviews.length
        });
      }

      if (usersRes.ok) {
        const userData = await usersRes.json();
        const usersList = userData.data || userData || [];
        const formattedUsers = usersList.map(u => ({
          id: u.id,
          avatar: `https://i.pravatar.cc/40?img=${u.id + 10}`,
          username: u.name
        }));
        setNewUsers(formattedUsers);
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu bình luận:", error);
      toast.error("Không thể tải dữ liệu bình luận!");
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsData(true);
  }, []);

  // ================= 2. CÁC HÀNH ĐỘNG CẬP NHẬT GIAO DIỆN TỨC THÌ =================
  const handleApprove = async (id) => {
    const commentToApprove = pendingComments.find(c => c.id === id) || recentComments.find(c => c.id === id);
    if (commentToApprove && commentToApprove.status !== 'approved') {
      setPendingComments(prev => prev.filter(c => c.id !== id));
      setRecentComments(prev => [{ ...commentToApprove, status: 'approved' }, ...prev.filter(c => c.id !== id)]);
    }

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews/${id}/approve`, {
        method: "PUT",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Đã duyệt bình luận!");
        fetchCommentsData(false);
      } else {
        toast.error("Không thể duyệt!");
        fetchCommentsData(false); 
      }
    } catch (error) {
      toast.error("Lỗi máy chủ!");
      fetchCommentsData(false);
    }
  };

  const handleHide = async (id) => {
    const inRecent = recentComments.find(c => c.id === id);
    
    if (inRecent) {
      // Nếu đang nằm ở bảng Đã duyệt -> Rút về bảng Chờ duyệt và làm mờ
      setRecentComments(prev => prev.filter(c => c.id !== id));
      setPendingComments(prev => [{...inRecent, status: 'hidden'}, ...prev]);
    } else {
      // Nếu đang nằm ở bảng Chờ duyệt -> Bật/Tắt làm mờ
      setPendingComments(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'hidden' ? 'pending' : 'hidden' } : c));
    }

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews/${id}/hide`, {
        method: "PUT",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Đã cập nhật trạng thái Ẩn!");
        fetchCommentsData(false);
      } else {
        toast.error("Không thể thay đổi trạng thái!");
        fetchCommentsData(false); 
      }
    } catch (error) {
      toast.error("Lỗi máy chủ!");
      fetchCommentsData(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này không?")) return;
    setPendingComments(prev => prev.filter(c => c.id !== id));
    setRecentComments(prev => prev.filter(c => c.id !== id));

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Đã xóa bình luận!");
        fetchCommentsData(false);
      } else {
        toast.error("Không thể xóa!");
        fetchCommentsData(false);
      }
    } catch (error) {
      toast.error("Lỗi máy chủ!");
      fetchCommentsData(false);
    }
  };

  // ================= 3. LỌC DỮ LIỆU ĐỔ RA BẢNG =================
  const filteredRecent = recentComments.filter(item => 
    item.user.toLowerCase().includes(keyword.toLowerCase()) ||
    item.content.toLowerCase().includes(keyword.toLowerCase()) ||
    item.product.toLowerCase().includes(keyword.toLowerCase())
  );

  // LOGIC MỚI: Nếu đang bật lọc rác, lấy từ TẤT CẢ bình luận (cả recent và pending)
  const sourceForPendingTable = filterReported ? [...pendingComments, ...recentComments] : pendingComments;

  const displayedPending = sourceForPendingTable.filter(item => {
    const matchesKeyword = item.user.toLowerCase().includes(keyword.toLowerCase()) ||
                           item.content.toLowerCase().includes(keyword.toLowerCase()) ||
                           item.product.toLowerCase().includes(keyword.toLowerCase());
    
    // Chỉ hiển thị bình luận có report_count > 0 nếu đang bật chế độ Lọc
    const matchesReportFilter = filterReported ? item.report_count > 0 : true;

    return matchesKeyword && matchesReportFilter;
  });

  if (initialLoading) {
    return (
      <div className="comments-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Đang tải dữ liệu...</h2>
      </div>
    );
  }

  return (
    <div className="comments-page">
      <Toaster position="top-right" />

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
            <h2>{stats.total}</h2>
          </div>
          <FiMessageCircle className="card-icon" />
        </div>

        <div className="comment-card">
          <div className="card-content">
            <span>Bình luận mới hôm nay</span>
            <h2>{stats.today}</h2>
          </div>
          <FiMessageSquare className="card-icon" />
        </div>

        <div className="comment-card">
          <div className="card-content">
            <span>Chờ duyệt</span>
            <h2>{stats.pending}</h2>
          </div>
          <FiHelpCircle className="card-icon" />
        </div>

        <div className="comment-card">
          <div className="card-content">
            <span>Sản phẩm nhiều bình luận nhất</span>
            <h3>{stats.topProduct}</h3>
            <p>{stats.topCount} BL</p>
          </div>
          <FiStar className="card-icon" />
        </div>
      </div>

      <div className="comment-content">

        {/* BÌNH LUẬN GẦN ĐÂY */}
        <div className="comment-table">
          <div className="table-title">
            <h3>Bình luận gần đây (Đã duyệt)</h3>
            <button onClick={() => fetchCommentsData(true)}>
              Làm mới
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
              {filteredRecent.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>Chưa có bình luận nào được duyệt.</td></tr>
              ) : (
                filteredRecent.map((item) => (
                  <tr key={item.id}>
                    <td className="user-cell">
                      <img src={item.avatar} alt="" />
                      {item.user}
                    </td>
                    <td>{item.product}</td>
                    <td>
                      {item.content}
                      {/* Hiển thị chú thích nếu bình luận đã duyệt này đang bị báo cáo */}
                      {item.report_count > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiFlag /> Bị báo cáo: {item.report_count} lần
                        </div>
                      )}
                    </td>
                    <td>{item.time}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BÌNH LUẬN CHƯA DUYỆT / BỊ BÁO CÁO */}
        <div className="comment-table">
          <div className="table-title">
            <h3>
              Bình luận chưa duyệt 
              {filterReported && <span style={{ color: '#ef4444', marginLeft: '10px', fontSize: '14px' }}>(Đang lọc rác)</span>}
            </h3>
            <button 
              onClick={() => setFilterReported(!filterReported)}
              style={{ 
                background: filterReported ? '#fee2e2' : '', 
                color: filterReported ? '#ef4444' : '',
                borderColor: filterReported ? '#fca5a5' : ''
              }}
            >
              <FiFlag />
              {filterReported ? "Hủy lọc (Xem tất cả)" : "Lọc bình luận bị báo cáo"}
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
              {displayedPending.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>{filterReported ? "Không có bình luận nào bị báo cáo." : "Không có bình luận chờ duyệt."}</td></tr>
              ) : (
                displayedPending.map((item) => (
                  <tr 
                    key={item.id}
                    style={{ 
                      opacity: item.status === 'hidden' ? 0.4 : 1,
                      backgroundColor: item.status === 'hidden' ? '#f3f4f6' : (item.report_count > 0 ? '#fff1f2' : 'transparent'),
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <td className="user-cell">
                      <img src={item.avatar} alt="" />
                      <span style={{ textDecoration: item.status === 'hidden' ? 'line-through' : 'none' }}>
                        {item.user}
                      </span>
                    </td>
                    <td>{item.product}</td>
                    <td>
                      {item.content}
                      {item.report_count > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiFlag /> Bị báo cáo: {item.report_count} lần
                        </div>
                      )}
                    </td>
                    <td>{item.time}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="approve-btn" 
                        onClick={() => handleApprove(item.id)}
                        disabled={item.status === 'approved'}
                        style={item.status === 'approved' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <FiCheck /> {item.status === 'approved' ? 'Đã duyệt' : 'Duyệt'}
                      </button>

                      <button 
                        className="hide-btn" 
                        onClick={() => handleHide(item.id)}
                        style={item.status === 'hidden' ? { background: '#6b7280', color: '#fff' } : {}}
                      >
                        <FiEyeOff /> {item.status === 'hidden' ? 'Đã ẩn' : 'Ẩn'}
                      </button>

                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* KHÁCH HÀNG MỚI */}
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
                  <td>#{item.id}</td>
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