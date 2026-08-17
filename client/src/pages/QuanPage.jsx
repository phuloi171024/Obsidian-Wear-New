import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProductPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { productService } from "../services/productService";
import toast, { Toaster } from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

export default function QuanPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc State
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all"); 
  const [sortOption, setSortOption] = useState("default");

  // State quản lý Popup & Giỏ hàng
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Mảng chứa ID các sản phẩm đã yêu thích
  const [favoriteIds, setFavoriteIds] = useState([]);

  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        // Đổi danh mục thành Quần
        const filters = { category: "Quần", sort: sortOption };

        if (selectedBrands.length > 0) filters.brand_ids = selectedBrands.join(',');
        if (priceFilter === "under_1m") filters.max_price = 1000000;
        else if (priceFilter === "1m_2m") { filters.min_price = 1000000; filters.max_price = 2000000; }
        else if (priceFilter === "over_2m") filters.min_price = 2000000;

        const data = await productService.getProducts(filters);
        setProducts(data);

        // Lấy danh sách yêu thích
        const token = localStorage.getItem("access_token");
        if (token) {
          const favRes = await fetch("http://localhost:8000/api/user/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const favData = await favRes.json();
          if (favData.status) {
            setFavoriteIds(favData.data.map((item) => item.product_id));
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu lọc sản phẩm Quần:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [selectedBrands, priceFilter, sortOption]);

  // Hàm Toggle Yêu Thích
  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault(); 
    e.stopPropagation();

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/user/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        if (data.is_favorite) {
          setFavoriteIds((prev) => [...prev, productId]); 
        } else {
          setFavoriteIds((prev) => prev.filter((id) => id !== productId)); 
        }
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  // Mở Modal Chọn Size/Màu
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
    const availableSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
    const availableColors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

    setSelectedSize(availableSizes.length > 0 ? availableSizes[0] : "");
    setSelectedColor(availableColors.length > 0 ? availableColors[0] : "");
    setShowModal(true);
  };

  // Hàm Thêm Giỏ Hàng
  const confirmAddToCart = async () => {
    try {
      setAddingToCart(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn!");
        navigate("/login");
        return;
      }

      const variants = activeProduct?.variants || [];
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
          Accept: "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          product_variant_id: matchedVariant.id,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Đã thêm sản phẩm vào giỏ hàng");
        setShowModal(false);
        if (isBuyNow) navigate("/cart");
        return;
      }

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        toast.error("Phiên đăng nhập đã hết hạn!");
        navigate("/login");
        return;
      }

      toast.error(data.message || "Không thể thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setAddingToCart(false);
    }
  };

  const activeVariants = activeProduct?.variants || [];
  const uniqueSizes = [...new Set(activeVariants.map((v) => v.size).filter(Boolean))];
  const uniqueColors = [...new Set(activeVariants.map((v) => v.color).filter(Boolean))];

  return (
    <>
      <Toaster position="top-right" />
      <div className="product-page">
        <aside className="sidebar">
          <div className="filter-title">Bộ lọc sản phẩm</div>
          <div className="filter-box">
            <h3>Thương hiệu</h3>
            <label><input type="checkbox" onChange={() => handleBrandToggle(2)} /> Adidas</label>
            <label><input type="checkbox" onChange={() => handleBrandToggle(4)} /> CoolMate</label>
            <label><input type="checkbox" onChange={() => handleBrandToggle(1)} /> Nike</label>
            <label><input type="checkbox" onChange={() => handleBrandToggle(3)} /> Puma</label>
          </div>
          <div className="filter-box">
            <h3>Khoảng giá</h3>
            <label><input type="radio" name="price" checked={priceFilter === "all"} onChange={() => setPriceFilter("all")} /> Tất cả</label>
            <label><input type="radio" name="price" checked={priceFilter === "under_1m"} onChange={() => setPriceFilter("under_1m")} /> Dưới 1.000.000đ</label>
            <label><input type="radio" name="price" checked={priceFilter === "1m_2m"} onChange={() => setPriceFilter("1m_2m")} /> 1.000.000đ - 2.000.000đ</label>
            <label><input type="radio" name="price" checked={priceFilter === "over_2m"} onChange={() => setPriceFilter("over_2m")} /> Trên 2.000.000đ</label>
          </div>
        </aside>

        <section className="product-content">
          <div className="top-bar">
            <h2>Bộ Sưu Tập Quần Thể Thao</h2>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="default">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
          <div className="breadcrumb">
            <span>Trang chủ</span><span className="arrow"> &gt; </span><span className="active">Quần</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>Đang tải sản phẩm...</div>
          ) : (
            <div className="shop-product-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="product-card-item">
                    <Link to={`/product/${product.id}`} className="card-link">
                      <div className="card-img-wrapper" style={{ position: "relative" }}>
                        {/* ĐÃ SỬA: Lấy ảnh từ product.thumbnail */}
                        <img
                          src={product.thumbnail ? product.thumbnail : "/images/placeholder.png"}
                          alt={product.name}
                        />
                        <button
                          onClick={(e) => handleToggleWishlist(e, product.id)}
                          title="Yêu thích"
                          style={{
                            position: "absolute", top: "10px", right: "10px",
                            background: "white", border: "none", borderRadius: "50%",
                            width: "36px", height: "36px", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer",
                            zIndex: 10, transition: "all 0.2s",
                            color: favoriteIds.includes(product.id) ? "#e11d48" : "#94a3b8",
                          }}
                        >
                          <FiHeart fill={favoriteIds.includes(product.id) ? "#e11d48" : "none"} size={18} />
                        </button>
                      </div>

                      <div className="card-info">
                        <h4 className="product-name">{product.name}</h4>
                        <div className="product-price">
                          {Number(product.price).toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </Link>

                    <div className="card-actions">
                      <button className="card-add-cart-btn" onClick={(e) => openVariantModal(e, product, false)} title="Thêm giỏ hàng">
                        🛒 Thêm giỏ
                      </button>
                      <button className="card-buy-now-btn" onClick={(e) => openVariantModal(e, product, true)} title="Mua ngay">
                        ⚡ Mua ngay
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#777", gridColumn: "1 / -1", padding: "40px" }}>Không tìm thấy sản phẩm quần phù hợp.</p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* POPUP CHỌN TÙY CHỌN SẢN PHẨM */}
      {showModal && activeProduct && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box variant-modal">
            <h3>Tuỳ chọn sản phẩm</h3>
            <div className="variant-product-info">
              {/* ĐÃ SỬA: Lấy ảnh từ activeProduct.thumbnail */}
              <img
                src={activeProduct.thumbnail ? activeProduct.thumbnail : "/images/placeholder.png"}
                alt={activeProduct.name}
              />
              <div>
                <h4>{activeProduct.name}</h4>
                <p className="price">
                  {Number(activeProduct.price).toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>

            <div className="variant-options">
              {uniqueSizes.length > 0 && (
                <div className="option-group">
                  <label>Kích cỡ (Size):</label>
                  <div className="option-buttons">
                    {uniqueSizes.map((s) => (
                      <button key={s} className={selectedSize === s ? "active" : ""} onClick={() => setSelectedSize(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {uniqueColors.length > 0 && (
                <div className="option-group">
                  <label>Màu sắc:</label>
                  <div className="option-buttons">
                    {uniqueColors.map((c) => (
                      <button key={c} className={selectedColor === c ? "active" : ""} onClick={() => setSelectedColor(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="custom-modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)} disabled={addingToCart}>Hủy</button>
              <button
                className="btn-confirm"
                style={{ background: "#4f46e5", opacity: addingToCart ? 0.7 : 1 }}
                onClick={confirmAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? "Đang xử lý..." : isBuyNow ? "Mua ngay" : "Thêm vào giỏ"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}