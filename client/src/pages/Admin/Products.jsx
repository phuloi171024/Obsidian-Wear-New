import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCheck, FiLayers, FiImage, FiUploadCloud } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Admin.css";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Thêm / Sửa sản phẩm
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Lưu ID nếu đang ở chế độ Sửa
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    category_id: "",
    brand_id: "",
    description: "",
    stock: 10,
    status: true,
  });

  // State quản lý Modal Popup Biến thể theo sản phẩm
  const [variantModal, setVariantModal] = useState({ show: false, product: null });
  const [productVariants, setProductVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ color: "", size: "", stock: 10 });

  // ==========================================
  // THÊM: STATE & REF CHO CHỨC NĂNG UP ẢNH
  // ==========================================
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);

  // ================= 1. GỌI API LẤY DANH SÁCH =================
  const fetchProducts = async (page = 1, keyword = "") => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/admin/products?page=${page}&search=${keyword}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        // [ĐÃ SỬA]: Code Cũ của em mong đợi data.data và phân trang.
        // Tuy nhiên ProductController.php hàm index() trả về mảng trực tiếp trong data.data
        // Do đó ta điều chỉnh lại cách nhận dữ liệu cho an toàn.
        const productList = Array.isArray(data.data) ? data.data : (data.data?.data || []);
        setProducts(productList);
        
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch("http://localhost:8000/api/admin/categories", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:8000/api/admin/brands", { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } catch (error) {
      console.error("Lỗi tải danh mục/thương hiệu");
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, search);
    fetchOptions();
  }, [currentPage]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchProducts(1, search);
    }
  };

  // ================= 2. MỞ MODAL THÊM HOẶC SỬA =================
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      sku: "",
      price: "",
      category_id: "",
      brand_id: "",
      description: "",
      stock: 10,
      status: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      sku: item.sku || "",
      price: item.price || "",
      category_id: item.category_id || "",
      brand_id: item.brand_id || "",
      description: item.description || "",
      stock: 0, 
      status: item.status ? true : false,
    });
    setShowModal(true);
  };

  // ================= 3. LƯU (THÊM / CẬP NHẬT) SẢN PHẨM =================
  const handleSaveProduct = async () => {
    if (!form.name || !form.sku || !form.price || !form.category_id) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    if (Number(form.price) < 0) {
      toast.error("Lỗi ngoại lệ: Giá sản phẩm không được là số âm!");
      return;
    }

    const token = localStorage.getItem("access_token");
    setIsSubmitting(true);

    const url = editingId 
      ? `http://localhost:8000/api/admin/products/${editingId}`
      : `http://localhost:8000/api/admin/products`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
        fetchProducts(currentPage, search);
        setShowModal(false);
      } else {
        toast.error(data.message || "Không thể lưu sản phẩm!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= 4. XÓA SẢN PHẨM =================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Xóa sản phẩm thành công!");
        fetchProducts(currentPage, search);
      } else {
        toast.error(data.message || "Không thể xóa sản phẩm!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  // ==========================================
  // [THÊM MỚI]: 5. CHỨC NĂNG UPLOAD ẢNH LÊN CLOUDINARY
  // ==========================================
  const triggerFileSelect = (productId) => {
    setUploadingId(productId);
    fileInputRef.current.click(); 
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingId) return;

    // Phải dùng FormData để gói file ảnh
    const formData = new FormData();
    formData.append("image_file", file);

    const toastId = toast.loading("Đang tải ảnh lên Cloudinary...");

    try {
      const token = localStorage.getItem("access_token");
      
      const res = await fetch(`http://localhost:8000/api/admin/products/${uploadingId}/image`, {
        method: "POST",
        headers: {
          "Accept": "application/json", // Đã bổ sung header để tránh lỗi CORS/Redirect
          "Authorization": `Bearer ${token}`
          // Tuyệt đối không khai báo Content-Type ở đây
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.status) {
        toast.success("Cập nhật ảnh thành công!", { id: toastId });
        
        // Cập nhật lại hình ảnh ngay lập tức trên giao diện
        setProducts(products.map(p => 
          p.id === uploadingId ? { ...p, thumbnail: data.thumbnail_url } : p
        ));
      } else {
        toast.error(data.message || "Lỗi khi up ảnh!", { id: toastId });
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ!", { id: toastId });
    } finally {
      setUploadingId(null);
      e.target.value = null; 
    }
  };

  // ================= 6. MỞ POPUP BIẾN THỂ THEO SẢN PHẨM =================
  const openVariantModal = async (product) => {
    setVariantModal({ show: true, product });
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${product.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProductVariants(data.variants || []);
      }
    } catch (error) {
      toast.error("Không thể tải biến thể sản phẩm!");
    }
  };

  const handleAddVariantInModal = async () => {
    if (!newVariant.color || !newVariant.size) {
      toast.error("Vui lòng nhập màu và size!");
      return;
    }
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${variantModal.product.id}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newVariant)
      });
      if (res.ok) {
        toast.success("Thêm biến thể thành công!");
        openVariantModal(variantModal.product); 
        setNewVariant({ color: "", size: "", stock: 10 });
      } else {
        toast.error("Không thể thêm biến thể!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối!");
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <div className="admin-page">
      <Toaster position="top-right" />

      {/* THẺ INPUT FILE ẨN CHỜ LỆNH UP ẢNH */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
      />

      {/* HEADER */}
      <div className="page-header">
        <h2>Quản lý sản phẩm</h2>
        <button className="add-btn" onClick={openAddModal}>
          <FiPlus />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-box" style={{ width: "350px" }}>
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm (Nhấn Enter)..."
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
              <th width="70">ID</th>
              <th width="120">Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>SKU</th>
              <th>Giá bán</th>
              <th>Trạng thái</th>
              <th width="140" style={{ textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#888" }}>Không tìm thấy sản phẩm nào.</td></tr>
            ) : (
              products.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  
                  {/* [THÊM MỚI]: Cột hiển thị ảnh và nút Upload */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '6px', border: '1px solid #eee', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <FiImage style={{ color: '#9ca3af', fontSize: '20px' }} />
                        )}
                      </div>
                      <button 
                        onClick={() => triggerFileSelect(item.id)}
                        disabled={uploadingId === item.id}
                        style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                        title="Tải ảnh lên"
                      >
                        <FiUploadCloud /> {uploadingId === item.id ? "Đang up" : "Sửa ảnh"}
                      </button>
                    </div>
                  </td>

                  <td><strong style={{ color: "#111827" }}>{item.name}</strong></td>
                  <td style={{ color: "#6b7280" }}>{item.sku}</td>
                  <td style={{ fontWeight: "600", color: "#10b981" }}>{formatVND(item.price)}</td>
                  <td>
                    <span className={item.status ? "status active" : "status lock"}>
                      {item.status ? "Đang bán" : "Ngừng bán"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns" style={{ justifyContent: "center" }}>
                      <button 
                        className="view-btn" 
                        title="Quản lý biến thể (Popup)" 
                        onClick={() => openVariantModal(item)}
                        style={{ background: "#e0e7ff", color: "#3b82f6" }}
                      >
                        <FiLayers />
                      </button>
                      <button className="view-btn" title="Chỉnh sửa" onClick={() => openEditModal(item)}>
                        <FiEdit2 />
                      </button>
                      <button className="lock-btn" title="Xóa" onClick={() => handleDelete(item.id)}>
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
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>{"<"}</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>{">"}</button>
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA SẢN PHẨM ================= */}
      {showModal && (
        <div className="category-modal">
          <div className="category-modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}><FiX /></button>
            </div>

            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Tên sản phẩm <span style={{ color: "red" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Nhập tên sản phẩm..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Mã SKU <span style={{ color: "red" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="VD: SKU-A01"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Giá bán (VND) <span style={{ color: "red" }}>*</span></label>
                  <input 
                    type="number" 
                    placeholder="VD: 250000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Danh mục <span style={{ color: "red" }}>*</span></label>
                  <select 
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Thương hiệu</label>
                  <select 
                    value={form.brand_id}
                    onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingId && (
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label>Số lượng tồn kho ban đầu <span style={{ color: "red" }}>*</span></label>
                  <input 
                    type="number" 
                    placeholder="VD: 50"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Trạng thái</label>
                <select 
                  value={form.status ? 1 : 0}
                  onChange={(e) => setForm({ ...form, status: Number(e.target.value) === 1 })}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                >
                  <option value={1}>Đang bán</option>
                  <option value={0}>Ngừng bán</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Mô tả sản phẩm</label>
                <textarea 
                  rows="3"
                  placeholder="Nhập mô tả..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none" }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)} disabled={isSubmitting}>Hủy</button>
              <button className="save-btn" onClick={handleSaveProduct} disabled={isSubmitting}>
                <FiCheck /> {isSubmitting ? "Đang xử lý..." : (editingId ? "Cập nhật" : "Lưu sản phẩm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP QUẢN LÝ BIẾN THỂ THEO SẢN PHẨM ================= */}
      {variantModal.show && (
        <div className="category-modal">
          <div className="category-modal-content" style={{ maxWidth: "650px" }}>
            <div className="modal-header">
              <h3>Biến thể của: <span style={{ color: "#2563eb" }}>{variantModal.product?.name}</span></h3>
              <button className="close-modal" onClick={() => setVariantModal({ show: false, product: null })}><FiX /></button>
            </div>

            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <table className="admin-table" style={{ marginBottom: "20px" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Màu sắc</th>
                    <th>Size</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {productVariants.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: "center", color: "#888" }}>Chưa có biến thể nào.</td></tr>
                  ) : (
                    productVariants.map(v => (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        <td><strong>{v.color}</strong></td>
                        <td>{v.size}</td>
                        <td style={{ color: "#10b981", fontWeight: "bold" }}>{v.stock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={{ background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Thêm biến thể mới cho sản phẩm này</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <input type="text" placeholder="Màu (VD: Đen)" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                  <input type="text" placeholder="Size (VD: L)" value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                  <input type="number" placeholder="Tồn kho" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: e.target.value})} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                </div>
                <button className="save-btn" onClick={handleAddVariantInModal} style={{ width: "100%", justifyContent: "center" }}>
                  <FiPlus /> Thêm biến thể
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}