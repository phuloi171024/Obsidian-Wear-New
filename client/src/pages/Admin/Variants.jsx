import { useState, useEffect } from "react";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiBox,
  FiShoppingBag,
  FiXCircle,
  FiAlertTriangle,
  FiX,
  FiCheck
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import "./Admin.css";

export default function Variants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==========================================
  // THÊM MỚI: STATE DÀNH CHO PHÂN TRANG
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Cài đặt số lượng biến thể muốn hiển thị trên 1 trang

  // Thống kê tổng quan
  const [stats, setStats] = useState({
    total: 0,
    selling: 0,
    out: 0,
    low: 0
  });

  // Modal Sửa biến thể nhanh
  const [editModal, setEditModal] = useState({ show: false, variant: null });
  const [editForm, setEditForm] = useState({ color: "", size: "", stock: 0 });

  // ================= 1. GỌI API LẤY TẤT CẢ BIẾN THỂ =================
  const fetchAllVariants = async (keyword = "") => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      // Ép lấy 1000 sản phẩm để chắc chắn gom được toàn bộ biến thể của cả web
      const res = await fetch(`http://localhost:8000/api/admin/products?per_page=1000&search=${keyword}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        const productsList = Array.isArray(data) ? data : (data.data || []);
        let allVariantsList = [];
        let totalCount = 0;
        let sellingCount = 0;
        let outCount = 0;
        let lowCount = 0;

        productsList.forEach(prod => {
          if (prod.variants && prod.variants.length > 0) {
            prod.variants.forEach(v => {
              totalCount++;
              let status = "Đang bán";
              let statusClass = "selling";

              if (v.stock === 0) {
                status = "Hết hàng";
                statusClass = "out";
                outCount++;
              } else if (v.stock <= 5) {
                status = "Sắp hết hàng";
                statusClass = "low";
                lowCount++;
              } else {
                sellingCount++;
              }

              allVariantsList.push({
                id: v.id,
                productId: prod.id,
                image: prod.thumbnail || "https://placehold.co/40",
                productName: prod.name,
                sku: prod.sku,
                size: v.size,
                color: v.color,
                price: prod.price,
                stock: v.stock,
                status: status,
                statusClass: statusClass
              });
            });
          }
        });

        setVariants(allVariantsList);
        setStats({
          total: totalCount,
          selling: sellingCount,
          out: outCount,
          low: lowCount
        });
        
        // Reset về trang 1 mỗi khi lấy lại dữ liệu (hoặc khi search)
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách biến thể!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVariants();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchAllVariants(search);
    }
  };

  // ================= 2. XÓA BIẾN THỂ =================
  const handleDelete = async (productId, variantId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${productId}/variants/${variantId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("Xóa biến thể thành công!");
        fetchAllVariants(search);
      } else {
        toast.error("Không thể xóa biến thể!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  // ================= 3. SỬA BIẾN THỂ =================
  const openEditModal = (item) => {
    setEditModal({ show: true, variant: item });
    setEditForm({ color: item.color, size: item.size, stock: item.stock });
  };

  const handleUpdateVariant = async () => {
    if (Number(editForm.stock) < 0) {
      toast.error("Số lượng tồn kho không được là số âm!");
      return;
    }

    const item = editModal.variant;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${item.productId}/variants/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        toast.success("Cập nhật biến thể thành công!");
        fetchAllVariants(search);
        setEditModal({ show: false, variant: null });
      } else {
        toast.error("Không thể cập nhật biến thể!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // ==========================================
  // THÊM MỚI: LOGIC TÍNH TOÁN PHÂN TRANG
  // ==========================================
  // 1. Tính toán index của phần tử đầu và phần tử cuối trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // 2. Cắt mảng tổng (variants) ra thành 1 mảng nhỏ chỉ chứa 10 phần tử để hiển thị
  const currentVariants = variants.slice(indexOfFirstItem, indexOfLastItem);
  
  // 3. Tính tổng số trang
  const totalPages = Math.ceil(variants.length / itemsPerPage);

  return (
    <div className="variants-page">
      <Toaster position="top-right" />

      {/* SEARCH */}
      <div className="variants-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm (Nhấn Enter)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* STATISTICS */}
      <div className="variants-stats">
        <div className="variant-stat total">
          <div>
            <span>Tổng số biến thể</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-icon total-icon"><FiBox /></div>
        </div>

        <div className="variant-stat selling-card">
          <div>
            <span>Biến thể đang bán</span>
            <strong>{stats.selling}</strong>
          </div>
          <div className="stat-icon selling-icon"><FiShoppingBag /></div>
        </div>

        <div className="variant-stat out-card">
          <div>
            <span>Biến thể hết hàng</span>
            <strong>{stats.out}</strong>
          </div>
          <div className="stat-icon out-icon"><FiXCircle /></div>
        </div>

        <div className="variant-stat low-card">
          <div>
            <span>Biến thể sắp hết hàng</span>
            <strong>{stats.low}</strong>
          </div>
          <div className="stat-icon low-icon"><FiAlertTriangle /></div>
        </div>
      </div>

      {/* TITLE + BUTTON */}
      <div className="variants-heading">
        <div>
          <h1>Quản lí tổng tất cả biến thể</h1>
          <p>Hệ thống quản lý toàn bộ size, màu sắc và tồn kho của sản phẩm.</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="variants-table-wrapper">
        <table className="variants-table">
          <thead>
            <tr>
              <th className="check-column"><input type="checkbox" /></th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mã SKU</th>
              <th>Kích thước</th>
              <th>Màu sắc</th>
              <th>Giá (VNĐ)</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>Đang tải danh sách biến thể...</td></tr>
            ) : variants.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#888" }}>Không tìm thấy biến thể nào.</td></tr>
            ) : (
              // BƯỚC ĐỔI QUAN TRỌNG: Render từ mảng "currentVariants" thay vì mảng gốc
              currentVariants.map((item) => (
                <tr key={item.id}>
                  <td className="check-column"><input type="checkbox" /></td>
                  <td>
                    <div className="variant-thumbnail">
                      <img src={item.image} alt="" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                    </div>
                  </td>
                  <td><strong>{item.productName}</strong></td>
                  <td className="variant-sku">{item.sku}</td>
                  <td>{item.size}</td>
                  <td>{item.color}</td>
                  <td className="variant-price">{formatVND(item.price)}đ</td>
                  <td><strong>{item.stock}</strong></td>
                  <td>
                    <span className={`variant-status ${item.statusClass}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="variant-actions">
                      <button className="variant-action edit" title="Chỉnh sửa" onClick={() => openEditModal(item)}>
                        <FiEdit />
                      </button>
                      <button className="variant-action delete" title="Xóa" onClick={() => handleDelete(item.productId, item.id)}>
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

      {/* ==========================================
          THÊM MỚI: GIAO DIỆN NÚT BẤM PHÂN TRANG 
          ========================================== */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: "20px" }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            {"<"}
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              className={currentPage === i + 1 ? "active" : ""} 
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            {">"}
          </button>
        </div>
      )}

      {/* MODAL CHỈNH SỬA BIẾN THỂ */}
      {editModal.show && (
        <div className="category-modal">
          <div className="category-modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3>Chỉnh sửa biến thể</h3>
              <button className="close-modal" onClick={() => setEditModal({ show: false, variant: null })}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Màu sắc</label>
                <input 
                  type="text" 
                  value={editForm.color} 
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Kích thước (Size)</label>
                <input 
                  type="text" 
                  value={editForm.size} 
                  onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Tồn kho</label>
                <input 
                  type="number" 
                  value={editForm.stock} 
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditModal({ show: false, variant: null })}>Hủy</button>
              <button className="save-btn" onClick={handleUpdateVariant}><FiCheck /> Cập nhật</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}