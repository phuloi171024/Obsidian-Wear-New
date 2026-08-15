import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import "./Admin.css"; 

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Phân trang Client-side (do API trả về mảng thay vì Paginator)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    status: 1, // 1 là Hoạt động, 0 là Ẩn
  });

  // ================= 1. GỌI API LẤY DANH SÁCH =================
  const fetchBrands = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/admin/brands", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách thương hiệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ================= 2. XỬ LÝ LỌC & PHÂN TRANG =================
  const filteredBrands = brands.filter((b) => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const currentData = filteredBrands.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [search]);

  // ================= 3. XỬ LÝ THÊM/SỬA (MODAL) =================
  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: "", status: 1 });
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setEditingId(brand.id);
    setForm({ name: brand.name, status: brand.status ? 1 : 0 });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ name: "", status: 1 });
  };

  const saveBrand = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu!");
      return;
    }

    const token = localStorage.getItem("access_token");
    const method = editingId ? "PUT" : "POST";
    const url = editingId 
      ? `http://localhost:8000/api/admin/brands/${editingId}` 
      : `http://localhost:8000/api/admin/brands`;

    setIsSubmitting(true);
    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          status: form.status === 1 || form.status === "1" ? true : false
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Lưu thương hiệu thành công!");
        fetchBrands(); // Refresh lại danh sách
        closeModal();
      } else {
        if (data.errors && data.errors.name) {
          toast.error("Tên thương hiệu này đã tồn tại!");
        } else {
          toast.error("Lỗi khi lưu thương hiệu!");
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= 4. XỬ LÝ XÓA =================
  const deleteBrand = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thương hiệu này?")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/brands/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Xóa thương hiệu thành công!");
        fetchBrands();
      } else {
        // Bắt lỗi không cho xóa nếu đang có sản phẩm (Logic Backend của em trả về 400)
        toast.error(data.message || "Không thể xóa thương hiệu này!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  return (
    <div className="admin-page">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="page-header">
        <h2>Quản lý thương hiệu</h2>
        <button className="add-btn" onClick={openAddModal}>
          <FiPlus />
          Thêm thương hiệu mới
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm tên thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th width="80">ID</th>
              <th width="250">Tên thương hiệu</th>
              <th>Đường dẫn (Slug)</th>
              <th width="150">Số sản phẩm</th>
              <th width="150">Trạng thái</th>
              <th width="120">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>Đang tải dữ liệu...</td></tr>
            ) : currentData.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#888" }}>Không tìm thấy thương hiệu nào.</td></tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td><strong style={{ color: "#111827" }}>{item.name}</strong></td>
                  <td style={{ color: "#6b7280" }}>{item.slug}</td>
                  <td style={{ fontWeight: "bold", color: "#2563eb" }}>{item.products_count}</td>
                  <td>
                    <span className={item.status ? "status active" : "status lock"}>
                      {item.status ? "Hoạt động" : "Đã ẩn"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="view-btn" onClick={() => openEditModal(item)} title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button className="lock-btn" onClick={() => deleteBrand(item.id)} title="Xóa">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            {"<"}
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            {">"}
          </button>
        </div>
      )}

      {/* MODAL THÊM/SỬA */}
      {showModal && (
        <div className="category-modal">
          <div className="category-modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h3>{editingId ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}</h3>
              <button className="close-modal" onClick={closeModal}><FiX /></button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tên thương hiệu <span style={{color: "red"}}>*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="VD: Nike, Adidas..."
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Trạng thái hiển thị</label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({...form, status: Number(e.target.value)})}
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Ẩn</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
              <button className="save-btn" onClick={saveBrand} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                <FiCheck /> {isSubmitting ? "Đang xử lý..." : (editingId ? "Cập nhật" : "Lưu thương hiệu")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}