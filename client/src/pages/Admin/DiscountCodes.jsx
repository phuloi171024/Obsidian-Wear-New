import { useState, useEffect } from "react";
import {
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiTag,
  FiPercent,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function DiscountCodes() {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho phân trang và bộ lọc
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    code: "",
    discount_type: "fixed",
    discount_value: "",
    min_order_value: "0",
    usage_limit: "100",
    expires_at: "",
    status: 1,
  });

  // State cho Checkbox & Xóa hàng loạt
  const [selectedIds, setSelectedIds] = useState([]);

  // =========================
  // 1. FETCH LẤY DỮ LIỆU
  // =========================
  const fetchCoupons = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/admin/coupons", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        const formattedData = (data.data || data).map(item => {
          let currentStatus = "Đang hoạt động";
          const now = new Date();
          const expiryDate = item.expires_at ? new Date(item.expires_at) : null;
          
          if (item.status === 0 || item.status === false) currentStatus = "Tạm ngưng";
          else if (item.used_count >= item.usage_limit) currentStatus = "Hết lượt";
          else if (expiryDate && expiryDate < now) currentStatus = "Hết hạn";

          let typeLabel = "Giảm giá tiền";
          let valLabel = `${Number(item.discount_value).toLocaleString("vi-VN")} VNĐ`;
          if (item.discount_type === 'percent') {
            typeLabel = "Giảm %";
            valLabel = `${item.discount_value}%`;
          } else if (item.discount_type === 'shipping') {
            typeLabel = "Freeship";
            valLabel = `Tối đa ${Number(item.discount_value).toLocaleString("vi-VN")} VNĐ`;
          }

          return {
            id: item.id,
            code: item.code,
            name: item.code,
            type: typeLabel,
            value: valLabel,
            condition: `Đơn từ ${Number(item.min_order_value || 0).toLocaleString("vi-VN")} đ`,
            duration: item.expires_at ? new Date(item.expires_at).toLocaleDateString('vi-VN') : "Không giới hạn",
            used: item.used_count || 0,
            maxUse: item.usage_limit || 0,
            status: currentStatus,
            raw: item 
          };
        });
        setDiscountCodes(formattedData);
        setSelectedIds([]); // Reset lại list chọn mỗi khi load lại
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu mã giảm giá!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // =========================
  // 2. XỬ LÝ CHECKBOX HÀNG LOẠT
  // =========================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentCodes.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mã giảm giá đã chọn không?`)) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/coupons/bulk`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (res.ok) {
        toast.success("Đã xóa các mã giảm giá được chọn!");
        fetchCoupons();
      } else {
        toast.error("Không thể xóa!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  // =========================
  // 3. XỬ LÝ FORM THÊM/SỬA
  // =========================
  const handleOpenAddModal = () => {
    setFormData({
      id: null,
      code: "",
      discount_type: "fixed",
      discount_value: "",
      min_order_value: "0",
      usage_limit: "100",
      expires_at: "",
      status: 1, // Mặc định là Hoạt động
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rawItem) => {
    let formattedDate = "";
    if (rawItem.expires_at) {
      formattedDate = new Date(rawItem.expires_at).toISOString().split('T')[0];
    }
    setFormData({
      id: rawItem.id,
      code: rawItem.code,
      discount_type: rawItem.discount_type,
      discount_value: rawItem.discount_value,
      min_order_value: rawItem.min_order_value,
      usage_limit: rawItem.usage_limit,
      expires_at: formattedDate,
      status: rawItem.status === false || rawItem.status === 0 ? 0 : 1, // Gắn chuẩn status 0 hoặc 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      toast.error("Vui lòng nhập đủ thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `http://localhost:8000/api/admin/coupons/${formData.id}` : `http://localhost:8000/api/admin/coupons`;
    const method = isEdit ? "PUT" : "POST";

    let finalDate = null;
    if (formData.expires_at) {
      finalDate = `${formData.expires_at} 23:59:59`;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_order_value: formData.min_order_value || 0,
      usage_limit: formData.usage_limit || 100,
      expires_at: finalDate,
      status: Number(formData.status), // Gửi 1 hoặc 0 xuống DB
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(isEdit ? "Cập nhật thành công!" : "Đã thêm mã mới!");
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.message || "Lỗi lưu mã giảm giá!");
      }
    } catch (error) {
      toast.error("Lỗi máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // 4. XÓA ĐƠN LẺ
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Đã xóa mã!");
        setDiscountCodes(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      toast.error("Lỗi máy chủ!");
    }
  };

  // =========================
  // LỌC & PHÂN TRANG
  // =========================
  const filteredCodes = discountCodes.filter((item) => {
    const matchKeyword = item.code.toLowerCase().includes(keyword.toLowerCase());
    const matchFilter =
      filter === "Tất cả" ||
      (filter === "Đang hoạt động" && item.status === "Đang hoạt động") ||
      (filter === "Hết lượt/Hết hạn" && (item.status === "Hết lượt" || item.status === "Hết hạn" || item.status === "Tạm ngưng")) ||
      (filter === "Sắp diễn ra" && item.status === "Sắp diễn ra");

    return matchKeyword && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCodes.length / itemsPerPage));
  const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentCodes = filteredCodes.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: discountCodes.length,
    active: discountCodes.filter(c => c.status === "Đang hoạt động").length,
    expired: discountCodes.filter(c => c.status === "Hết hạn" || c.status === "Hết lượt" || c.status === "Tạm ngưng").length,
  };

  return (
    <div className="discount-page">
      <Toaster position="top-right" />

      {/* ================= MODAL THÊM / SỬA ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{formData.id ? "Sửa Mã Giảm Giá" : "Thêm Mã Mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Mã Code *</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', textTransform: 'uppercase' }} />
                </div>
                {/* THÊM TRẠNG THÁI VÀO ĐÂY */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: Number(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: formData.status === 1 ? '#dcfce7' : '#fee2e2', color: formData.status === 1 ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Ngưng HĐ</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Loại giảm</label>
                  <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <option value="fixed">Giảm số tiền</option>
                    <option value="percent">Giảm phần trăm (%)</option>
                    <option value="shipping">Miễn phí ship</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Giá trị giảm *</label>
                  <input required type="number" min="0" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Đơn tối thiểu (VNĐ)</label>
                  <input type="number" min="0" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Số lượt dùng</label>
                  <input type="number" min="1" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Ngày hết hạn</label>
                <input type="date" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Đang lưu..." : "Lưu mã"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          HEADER & BUTTONS
      ================================================= */}
      <div className="discount-page-header">
        <div><h1>Quản lí mã giảm giá</h1></div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <FiTrash2 /> Xóa {selectedIds.length} mục đã chọn
            </button>
          )}

          <button className="discount-add-btn" onClick={handleOpenAddModal}>
            <FiPlus /> Thêm mã mới
          </button>
        </div>
      </div>

      <div className="discount-statistics">
        <div className="discount-stat-card">
          <div><span>Tổng mã</span><strong>{stats.total}</strong></div><FiTag className="discount-stat-icon" />
        </div>
        <div className="discount-stat-card">
          <div><span>Đang hoạt động</span><strong>{stats.active}</strong></div><FiPercent className="discount-stat-icon active-icon" />
        </div>
        <div className="discount-stat-card">
          <div><span>Tạm ngưng / Hết hạn</span><strong>{stats.expired}</strong></div><FiClock className="discount-stat-icon expired-icon" />
        </div>
      </div>

      <div className="discount-toolbar">
        <div className="discount-filters">
          <button className={filter === "Tất cả" ? "active" : ""} onClick={() => {setFilter("Tất cả"); setCurrentPage(1);}}>Tất cả</button>
          <button className={filter === "Đang hoạt động" ? "active" : ""} onClick={() => {setFilter("Đang hoạt động"); setCurrentPage(1);}}>Đang hoạt động</button>
          <button className={filter === "Hết lượt/Hết hạn" ? "active" : ""} onClick={() => {setFilter("Hết lượt/Hết hạn"); setCurrentPage(1);}}>Hết lượt/Hết hạn</button>
        </div>
        <div className="discount-search">
          <FiSearch />
          <input type="text" placeholder="Tìm mã code..." value={keyword} onChange={(e) => {setKeyword(e.target.value); setCurrentPage(1);}} />
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}
      <div className="discount-table-wrapper">
        <table className="discount-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={currentCodes.length > 0 && selectedIds.length === currentCodes.length}
                  onChange={handleSelectAll} 
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
              </th>
              <th>Mã code</th>
              <th>Loại giảm</th>
              <th>Giá trị</th>
              <th>Điều kiện</th>
              <th>Thời hạn</th>
              <th>Lượt dùng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</td></tr>
            ) : currentCodes.map((item) => (
              <tr key={item.id} style={{ opacity: item.status === 'Tạm ngưng' ? 0.5 : 1 }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </td>
                <td><strong>{item.code}</strong></td>
                <td>{item.type}</td>
                <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.value}</td>
                <td>{item.condition}</td>
                <td>{item.duration}</td>
                <td>{item.used} / {item.maxUse}</td>
                <td>
                  <span className={`discount-status ${
                      item.status === "Đang hoạt động" ? "status-active"
                        : item.status === "Sắp diễn ra" ? "status-coming"
                        : item.status === "Tạm ngưng" ? "status-expired"
                        : "status-used"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="discount-actions">
                    <button title="Sửa" onClick={() => handleOpenEditModal(item.raw)}><FiEdit /></button>
                    <button title="Xóa" className="delete" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && currentCodes.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#999" }}>Không tìm thấy mã giảm giá</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          PHÂN TRANG
      ================================================= */}
      <div className="discount-pagination">
        <button disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(safeCurrentPage - 1)}><FiChevronLeft /></button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button key={page} className={safeCurrentPage === page ? "active" : ""} onClick={() => setCurrentPage(page)}>{page}</button>
        ))}
        <button disabled={safeCurrentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(safeCurrentPage + 1)}><FiChevronRight /></button>
      </div>

    </div>
  );
}