import React, { useState, useEffect } from "react";
import "./ProductPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";

export default function QuanPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all"); 
  const [sortOption, setSortOption] = useState("default");

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
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu lọc sản phẩm Quần:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [selectedBrands, priceFilter, sortOption]);

  return (
    <>
      
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
                products.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <p style={{ textAlign: "center", color: "#777", gridColumn: "1 / -1", padding: "40px" }}>Không tìm thấy sản phẩm quần phù hợp.</p>
              )}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}