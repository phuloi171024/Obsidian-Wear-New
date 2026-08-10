import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // <-- Thêm useLocation
import "./ProductPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { productService } from "../services/productService";
import toast, { Toaster } from "react-hot-toast";

export default function ProductPage() {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Đọc URL hiện tại
  
  // Lấy từ khóa search từ trên thanh URL xuống
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  // State quản lý Popup
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleBrandToggle = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const filters = { sort: sortOption };

        // THÊM TỪ KHÓA TÌM KIẾM VÀO BỘ LỌC GỬI XUỐNG LARAVEL
        if (searchKeyword) filters.search = searchKeyword;

        if (selectedCategory) filters.category = selectedCategory;
        if (selectedBrands.length > 0) filters.brand_ids = selectedBrands.join(",");

        if (priceFilter === "under_1m") filters.max_price = 1000000;
        else if (priceFilter === "1m_2m") {
          filters.min_price = 1000000;
          filters.max_price = 2000000;
        } else if (priceFilter === "over_2m") {
          filters.min_price = 2000000;
        }

        const data = await productService.getProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedBrands, priceFilter, sortOption, searchKeyword]); // Cập nhật lại mỗi khi gõ tìm kiếm mới

  const openVariantModal = (e, product, buyNow = false) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }

    setActiveProduct(product);
    setIsBuyNow(buyNow);

    const variants = product.variants || [];
    const availableSizes = [...new Set(variants.map(v => v.size))];
    const availableColors = [...new Set(variants.map(v => v.color))];

    setSelectedSize(availableSizes.length > 0 ? availableSizes[0] : "");
    setSelectedColor(availableColors.length > 0 ? availableColors[0] : "");

    setShowModal(true);
  };

  const confirmAddToCart = async () => {
    try {
      setAddingToCart(true);
      const token = localStorage.getItem("access_token");

      const variants = activeProduct.variants || [];
      const matchedVariant = variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );

      if (!matchedVariant) {
        toast.error("Phiên bản sản phẩm này hiện không có sẵn trong hệ thống!");
        return;
      }

      const res = await fetch("http://localhost:8000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token?.trim()}`
        },
        body: JSON.stringify({
          product_variant_id: matchedVariant.id,
          quantity: 1,
          product_id: activeProduct.id,
          size: selectedSize,
          color: selectedColor
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Đã thêm ${activeProduct.name} vào giỏ!`);
        setShowModal(false);
        if (isBuyNow) {
          navigate("/cart");
        }
      } else {
        toast.error(data.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setAddingToCart(false);
    }
  };

  const activeVariants = activeProduct?.variants || [];
  const uniqueSizes = [...new Set(activeVariants.map(v => v.size))].filter(Boolean);
  const uniqueColors = [...new Set(activeVariants.map(v => v.color))].filter(Boolean);

  return (
    <>
      <Toaster position="top-right" />

      <div className="product-page">
        {/* SIDEBAR BỘ LỌC (Giữ nguyên 100%) */}
        <aside className="sidebar">
          <div className="filter-title">Bộ lọc sản phẩm</div>

          <div className="filter-box">
            <h3>Danh mục</h3>
            <label><input type="radio" name="category" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")}/><span>Tất cả</span></label>
            <label><input type="radio" name="category" checked={selectedCategory === "Áo"} onChange={() => setSelectedCategory("Áo")}/><span>Áo Thể Thao</span></label>
            <label><input type="radio" name="category" checked={selectedCategory === "Giày"} onChange={() => setSelectedCategory("Giày")}/><span>Giày Thể Thao</span></label>
            <label><input type="radio" name="category" checked={selectedCategory === "Túi"} onChange={() => setSelectedCategory("Túi")}/><span>Túi & Phụ kiện</span></label>
          </div>

          <div className="filter-box">
            <h3>Thương hiệu</h3>
            <label><input type="checkbox" onChange={() => handleBrandToggle(2)} /><span>Adidas</span></label>
            <label><input type="checkbox" onChange={() => handleBrandToggle(4)} /><span>CoolMate</span></label>
            <label><input type="checkbox" onChange={() => handleBrandToggle(1)} /><span>Nike</span></label>
            <label><input type="checkbox" onChange={() => handleBrandToggle(3)} /><span>Puma</span></label>
          </div>

          <div className="filter-box">
            <h3>Khoảng giá</h3>
            <label><input type="radio" name="price" checked={priceFilter === "all"} onChange={() => setPriceFilter("all")} /><span>Tất cả</span></label>
            <label><input type="radio" name="price" checked={priceFilter === "under_1m"} onChange={() => setPriceFilter("under_1m")} /><span>Dưới 1.000.000đ</span></label>
            <label><input type="radio" name="price" checked={priceFilter === "1m_2m"} onChange={() => setPriceFilter("1m_2m")} /><span>1.000.000đ - 2.000.000đ</span></label>
            <label><input type="radio" name="price" checked={priceFilter === "over_2m"} onChange={() => setPriceFilter("over_2m")} /><span>Trên 2.000.000đ</span></label>
          </div>
        </aside>

        {/* NỘI DUNG SẢN PHẨM */}
        <section className="product-content">
          <div className="top-bar">
            {/* HIỂN THỊ TIÊU ĐỀ THÔNG MINH TÙY THEO ĐANG TÌM KIẾM HAY LỌC DANH MỤC */}
            <h2>
              {searchKeyword 
                ? `Kết quả tìm kiếm cho: "${searchKeyword}"` 
                : selectedCategory 
                ? `Sản phẩm ${selectedCategory}` 
                : "Tất cả sản phẩm"
              }
            </h2>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="default">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="latest">Mới nhất</option>
            </select>
          </div>

          <div className="breadcrumb">
            <span>Trang chủ</span> <span className="arrow">&gt;</span> <span className="active">Sản phẩm</span>
          </div>

          {loading ? (
            <div className="loading-state">Đang tải sản phẩm...</div>
          ) : (
            <div className="shop-product-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="product-card-item">
                    <Link to={`/product/${product.id}`} className="card-link">
                      <div className="card-img-wrapper">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0].image_url : "/images/placeholder.png"}
                          alt={product.name}
                        />
                      </div>
                      <div className="card-info">
                        <h4 className="product-name">{product.name}</h4>
                        <div className="product-price">{Number(product.price).toLocaleString("vi-VN")} đ</div>
                      </div>
                    </Link>

                    <div className="card-actions">
                      <button
                        className="card-add-cart-btn"
                        onClick={(e) => openVariantModal(e, product, false)}
                        title="Thêm giỏ hàng"
                      >
                        🛒 Thêm giỏ
                      </button>
                      <button
                        className="card-buy-now-btn"
                        onClick={(e) => openVariantModal(e, product, true)}
                        title="Mua ngay"
                      >
                        ⚡ Mua ngay
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  {searchKeyword 
                    ? `Không tìm thấy sản phẩm nào khớp với từ khóa "${searchKeyword}".` 
                    : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc."}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* POPUP HIỂN THỊ ĐÚNG DỮ LIỆU TỪ DATABASE (Giữ nguyên 100%) */}
      {showModal && activeProduct && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box variant-modal">
            <h3>Tuỳ chọn sản phẩm</h3>
            <div className="variant-product-info">
              <img 
                src={activeProduct.images && activeProduct.images.length > 0 ? activeProduct.images[0].image_url : "/images/placeholder.png"} 
                alt={activeProduct.name} 
              />
              <div>
                <h4>{activeProduct.name}</h4>
                <p className="price">{Number(activeProduct.price).toLocaleString("vi-VN")} đ</p>
              </div>
            </div>

            <div className="variant-options">
              {uniqueSizes.length > 0 && (
                <div className="option-group">
                  <label>Kích cỡ (Size):</label>
                  <div className="option-buttons">
                    {uniqueSizes.map(s => (
                      <button 
                        key={s} 
                        className={selectedSize === s ? 'active' : ''} 
                        onClick={() => setSelectedSize(s)}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {uniqueColors.length > 0 && (
                <div className="option-group">
                  <label>Màu sắc:</label>
                  <div className="option-buttons">
                    {uniqueColors.map(c => (
                      <button 
                        key={c} 
                        className={selectedColor === c ? 'active' : ''} 
                        onClick={() => setSelectedColor(c)}
                      >{c}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="custom-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowModal(false)}
                disabled={addingToCart}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm" 
                style={{ background: '#4f46e5', opacity: addingToCart ? 0.7 : 1 }} 
                onClick={confirmAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? "Đang xử lý..." : (isBuyNow ? "Mua ngay" : "Thêm vào giỏ")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}