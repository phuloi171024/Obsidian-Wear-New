import React, { useState, useEffect } from "react";
import "./ProductPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Các State quản lý bộ lọc
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  // Xử lý chọn Thương hiệu
  const handleBrandToggle = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Gọi API lấy dữ liệu mỗi khi bộ lọc thay đổi
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const filters = { sort: sortOption };

        if (selectedCategory) filters.category = selectedCategory;
        if (selectedBrands.length > 0) filters.brand_ids = selectedBrands.join(",");
        
        if (priceFilter === "under_1m") filters.max_price = 1000000;
        else if (priceFilter === "1m_2m") {
          filters.min_price = 1000000;
          filters.max_price = 2000000;
        } else if (priceFilter === "over_2m") filters.min_price = 2000000;

        const data = await productService.getProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedBrands, priceFilter, sortOption]);

  return (
    <>
      <Header />

      <div className="product-page">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="filter-title">Bộ lọc</div>

          <div className="filter-box">
            <h3>Danh mục</h3>
            <label>
              <input type="radio" name="category" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")} /> Tất cả
            </label>
            <label>
              <input type="radio" name="category" checked={selectedCategory === "Áo"} onChange={() => setSelectedCategory("Áo")} /> Áo
            </label>
            <label>
              <input type="radio" name="category" checked={selectedCategory === "Quần"} onChange={() => setSelectedCategory("Quần")} /> Quần
            </label>
            <label>
              <input type="radio" name="category" checked={selectedCategory === "Túi"} onChange={() => setSelectedCategory("Túi")} /> Túi
            </label>
            <label>
              <input type="radio" name="category" checked={selectedCategory === "Giày"} onChange={() => setSelectedCategory("Giày")} /> Giày
            </label>
          </div>

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

        {/* Content */}
        <section className="product-content">
          <div className="top-bar">
            <h2>{selectedCategory ? `Sản phẩm ${selectedCategory}` : "Tất cả sản phẩm"}</h2>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="default">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="latest">Mới nhất</option>
            </select>
          </div>

          <div className="breadcrumb">
            <span>Trang chủ</span>
            <span className="arrow"> &gt; </span>
            <span className="active">Sản phẩm</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>Đang tải sản phẩm...</div>
          ) : (
            <div className="shop-product-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px", color: "#777" }}>
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  );
}