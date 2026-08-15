import { useState, useEffect } from "react";
import { FiSearch, FiEye, FiLock, FiUnlock, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho Modal Xác nhận Khóa/Mở khóa
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null });

  // State cho Modal Xem chi tiết
  const [viewModal, setViewModal] = useState({ show: false, data: null, isLoading: false });

  // ================= 1. API LẤY DANH SÁCH =================
  const fetchUsers = async (page = 1, keyword = "") => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/admin/users?page=${page}&search=${keyword}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setUsers(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, search);
  }, [currentPage]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchUsers(1, search);
    }
  };

  // ================= 2. MỞ POPUP XÁC NHẬN =================
  const openConfirmModal = (user) => {
    setConfirmModal({ show: true, user: user });
  };

  // ================= 3. THỰC THI KHÓA / MỞ KHÓA =================
  const executeToggleStatus = async () => {
    const user = confirmModal.user;
    if (!user) return;

    const token = localStorage.getItem("access_token");
    const actionText = user.status ? "KHOÁ" : "MỞ KHÓA";

    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `Đã ${actionText} tài khoản thành công!`);
        setUsers(users.map(u => u.id === user.id ? { ...u, status: !u.status } : u));
        setConfirmModal({ show: false, user: null }); // Đóng Modal
      } else {
        toast.error(data.message || "Không thể thực hiện thao tác này!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    }
  };

  // ================= 4. XEM CHI TIẾT USER =================
  const handleViewUser = async (id) => {
    setViewModal({ show: true, data: null, isLoading: true });
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setViewModal({ show: true, data: data, isLoading: false });
      } else {
        toast.error("Không thể lấy thông tin chi tiết!");
        setViewModal({ show: false, data: null, isLoading: false });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
      setViewModal({ show: false, data: null, isLoading: false });
    }
  };

  return (
    <div className="admin-page">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="page-header">
        <h2>Quản lí thành viên</h2>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-box" style={{ width: "350px" }}>
          <FiSearch />
          <input
            type="text"
            placeholder="Nhập tên, email, SĐT rồi nhấn Enter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày đăng ký</th>
              <th>Đơn hàng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#888" }}>Không tìm thấy thành viên nào.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="user-info">
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e0e7ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "600", color: "#111827" }}>
                        {user.name} 
                        {user.role === 'admin' && <span style={{fontSize: '11px', color: '#ef4444', marginLeft: '5px'}}>(Admin)</span>}
                      </span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || "---"}</td>
                  <td>{new Date(user.created_at).toLocaleDateString("vi-VN")}</td>
                  <td style={{ fontWeight: "bold", color: "#3b82f6" }}>{user.orders_count || 0}</td>
                  <td>
                    <span className={user.status ? "status active" : "status lock"}>
                      {user.status ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="view-btn" title="Xem chi tiết" onClick={() => handleViewUser(user.id)}>
                        <FiEye />
                      </button>
                      
                      {user.role !== 'admin' && (
                        user.status ? (
                          <button className="lock-btn" title="Khóa tài khoản" onClick={() => openConfirmModal(user)}>
                            <FiLock />
                          </button>
                        ) : (
                          <button className="unlock-btn" title="Mở khóa tài khoản" onClick={() => openConfirmModal(user)}>
                            <FiUnlock />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* HIỂN THỊ PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>{"<"}</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>{">"}</button>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN KHÓA/MỞ KHÓA ================= */}
      {confirmModal.show && (
        <div className="category-modal">
          <div className="category-modal-content" style={{ maxWidth: "400px", padding: "30px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", color: confirmModal.user?.status ? "#ef4444" : "#10b981", marginBottom: "15px" }}>
              {confirmModal.user?.status ? <FiLock style={{ margin: "0 auto"}}/> : <FiUnlock style={{ margin: "0 auto"}}/>}
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#111827" }}>
              Xác nhận {confirmModal.user?.status ? "Khóa" : "Mở khóa"} tài khoản
            </h3>
            <p style={{ color: "#4b5563", lineHeight: "1.5", marginBottom: "25px" }}>
              Bạn có chắc chắn muốn {confirmModal.user?.status ? "khóa" : "mở khóa"} tài khoản <strong style={{ color: "#111827" }}>{confirmModal.user?.name}</strong>?
              {confirmModal.user?.status && <br/>}
              {confirmModal.user?.status && <span style={{ fontSize: "13px", color: "#ef4444" }}>(Người dùng sẽ không thể đăng nhập)</span>}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button className="cancel-btn" onClick={() => setConfirmModal({ show: false, user: null })}>
                Hủy bỏ
              </button>
              <button 
                className="save-btn" 
                style={{ background: confirmModal.user?.status ? "#ef4444" : "#10b981" }} 
                onClick={executeToggleStatus}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT USER ================= */}
      {viewModal.show && (
        <div className="category-modal">
          <div className="category-modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>Hồ sơ khách hàng</h3>
              <button className="close-modal" onClick={() => setViewModal({ show: false, data: null })}><FiX /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {viewModal.isLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Đang tải thông tin...</div>
              ) : viewModal.data ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#e0e7ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>
                      {viewModal.data.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#111827" }}>{viewModal.data.name}</h3>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>{viewModal.data.email}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Số điện thoại</label>
                      <strong style={{ color: "#111827" }}>{viewModal.data.phone || "Chưa cập nhật"}</strong>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Ngày tham gia</label>
                      <strong style={{ color: "#111827" }}>{new Date(viewModal.data.created_at).toLocaleDateString("vi-VN")}</strong>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Tổng đơn hàng</label>
                      <strong style={{ color: "#3b82f6", fontSize: "16px" }}>{viewModal.data.orders_count} đơn</strong>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Trạng thái</label>
                      <span className={viewModal.data.status ? "status active" : "status lock"} style={{ padding: "4px 8px", borderRadius: "4px" }}>
                        {viewModal.data.status ? "Đang hoạt động" : "Đã bị khóa"}
                      </span>
                    </div>
                  </div>

                  <h4 style={{ margin: "20px 0 10px 0", fontSize: "15px", color: "#374151" }}>Lịch sử mua hàng gần đây</h4>
                  {viewModal.data.orders && viewModal.data.orders.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", textAlign: "left", fontSize: "12px", color: "#6b7280" }}>
                          <th style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>Mã đơn</th>
                          <th style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>Ngày đặt</th>
                          <th style={{ padding: "8px", borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewModal.data.orders.map(order => (
                          <tr key={order.id}>
                            <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6", fontSize: "13px", fontWeight: "600" }}>#{order.id}</td>
                            <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                            <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6", fontSize: "13px", color: "#10b981", fontWeight: "600", textAlign: "right" }}>
                              {new Intl.NumberFormat('vi-VN').format(order.total_amount)}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "#6b7280", fontSize: "13px", fontStyle: "italic", margin: 0 }}>Khách hàng chưa có đơn hàng nào.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}