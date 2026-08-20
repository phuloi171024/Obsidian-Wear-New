import { useMemo, useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiUsers,
  FiShoppingCart,
  FiX,
  FiCheck,
  FiMenu,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast"; // Thư viện thông báo

export default function Categories() {
  const [categories, setCategories] = useState([]); // Đã xóa dữ liệu giả mạo
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // Lưu ID danh mục đang sửa
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Hiển thị",
    image: "", 
  });

  // ==========================================
  // 1. GỌI API LẤY DANH SÁCH DANH MỤC TỪ LARAVEL
  // ==========================================
  const fetchCategories = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/admin/categories", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        // Chuyển đổi dữ liệu backend cho khớp với frontend
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          image: "/images/categories/default.jpg", // Tạm thời dùng ảnh mặc định nếu DB chưa có cột ảnh
          products: item.products_count || 0, // Laravel withCount('products') trả về products_count
          status: item.status === 1 || item.status === true ? "Hiển thị" : "Ẩn",
        }));
        setCategories(formattedData);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API khi vừa mở trang
  useEffect(() => {
    fetchCategories();
  }, []);

  // Lọc và Phân trang (Giữ nguyên logic cũ của em)
  const filteredData = useMemo(() => {
    return categories.filter((item) => {
      const matchName = item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Tất cả" || item.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalCategories = categories.length;
  const totalVisible = categories.filter((item) => item.status === "Hiển thị").length;
  const totalHidden = categories.filter((item) => item.status === "Ẩn").length;  

  // Mở Modal Thêm mới
  const openAddModal = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      status: "Hiển thị",
      image: "/images/categories/default.jpg",
    });
    setShowModal(true);
  };

  // Mở Modal Sửa
  const openEditModal = (item) => {
    setEditing(item.id);
    setForm({
      name: item.name,
      description: item.description,
      status: item.status,
      image: item.image,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  // ==========================================
  // 2. GỌI API THÊM / CẬP NHẬT DANH MỤC
  // ==========================================
  const saveCategory = async () => {
    if (form.name.trim() === "") {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    const token = localStorage.getItem("access_token");
    const isUpdating = editing !== null;
    const url = isUpdating 
      ? `http://localhost:8000/api/admin/categories/${editing}` 
      : `http://localhost:8000/api/admin/categories`;
    const method = isUpdating ? "PUT" : "POST";

    // Chuẩn bị dữ liệu gửi xuống Backend
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status === "Hiển thị" ? 1 : 0 // Ép kiểu về 1/0 cho Laravel
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isUpdating ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchCategories(); // Gọi lại hàm lấy dữ liệu để làm mới bảng
        closeModal();
      } else {
        toast.error(data.message || data.errors?.name?.[0] || "Có lỗi xảy ra!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  // ==========================================
  // 3. GỌI API XÓA DANH MỤC
  // ==========================================
  const deleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success("Xóa danh mục thành công!");
        fetchCategories(); // Cập nhật lại bảng
        setSelectedRows(prev => prev.filter(item => item !== id));
      } else {
        toast.error(data.message || "Không thể xóa danh mục đang có sản phẩm!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((item) => item !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentData.map((item) => item.id));
    }
  };

  return (
    <div className="categories-page">
      <Toaster position="top-right" /> {/* Component hiển thị thông báo */}

      {/* ================= HEADER ================= */}
      <div className="categories-header">
        <div>
          <h2>Quản lý danh mục</h2>
        </div>
        <button className="add-category-btn" onClick={openAddModal}>
          <FiPlus />
          Tạo danh mục mới
        </button>
      </div>

      {/* ================= STATISTIC ================= */}
      <div className="category-cards">
        <div className="category-card">
          <div>
            <p>Tổng danh mục</p>
            <h1>{totalCategories}</h1>
          </div>
          <div className="card-icon"><FiFolder /></div>
        </div>
        <div className="category-card">
          <div>
            <p>Đang hiển thị</p>
            <h1>{totalVisible}</h1>
          </div>
          <div className="card-icon"><FiUsers /></div>
        </div>
        <div className="category-card">
          <div>
            <p>Đã ẩn</p>
            <h1>{totalHidden}</h1>
          </div>
          <div className="card-icon"><FiShoppingCart /></div>
        </div>
      </div>

      {/* ================= TOOLBAR ================= */}
      <div className="category-toolbar">
        <div className="toolbar-left">
          <label>Lọc trạng thái</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>Tất cả</option>
            <option>Hiển thị</option>
            <option>Ẩn</option>
          </select>
        </div>
        <div className="toolbar-right">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm tên danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="filter-menu-btn"><FiMenu /></button>
        </div>
      </div>      

      {/* ================= TABLE ================= */}
      <div className="category-table">
        <div className="category-table-scroll">
          <table>
            <thead>
              <tr>
                <th width="50">
                  <input
                    type="checkbox"
                    checked={currentData.length > 0 && currentData.every(item => selectedRows.includes(item.id))}
                    onChange={toggleAll}
                  />
                </th>
                <th width="80">ID</th>
                <th width="90">Hình</th>
                <th width="240">Tên danh mục</th>
                <th>Mô tả</th>
                <th width="120">Sản phẩm</th>
                <th width="140">Trạng thái</th>
                <th width="130">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{textAlign:"center", padding:"20px"}}>Đang tải dữ liệu...</td></tr>
              ) : currentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => toggleRow(item.id)}
                    />
                  </td>
                  <td>#{item.id}</td>
                  <td>
                    <img src={item.image} alt={item.name} className="category-image" style={{width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px"}}/>
                  </td>
                  <td><span className="category-name">{item.name}</span></td>
                  <td>{item.description}</td>
                  <td><strong style={{color:"#3b82f6"}}>{item.products}</strong> SP</td>
                  <td>
                    <span className={item.status === "Hiển thị" ? "status-badge active" : "status-badge inactive"}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="edit-btn" onClick={() => openEditModal(item)}><FiEdit2 /></button>
                      <button className="delete-btn" onClick={() => deleteCategory(item.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && currentData.length === 0 && (
                <tr><td colSpan="8" className="empty-table">Không có dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>      
      
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index} className={currentPage === index + 1 ? "active" : ""} onClick={() => setCurrentPage(index + 1)}>
              {index + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="category-modal">
          <div className="category-modal-content">
            <div className="modal-header">
              <h3>{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h3>
              <button className="close-modal" onClick={closeModal}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên danh mục <span style={{color:"red"}}>*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên danh mục..."/>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Hiển thị</option>
                  <option>Ẩn</option>
                </select>
              </div>
              {/* <div className="form-group">
                <label>Đường dẫn hình ảnh</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}/>
              </div> */}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>Hủy</button>
              <button className="save-btn" onClick={saveCategory}>
                <FiCheck /> {editing ? "Cập nhật" : "Lưu danh mục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}