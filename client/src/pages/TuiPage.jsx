// src/pages/TuiPage.jsx
import "./ProductPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import products from "../data/products";

export default function TuiPage() {
  const tuiProducts = products.filter((p) => p.category === "Túi");

  return (
    <>
      <Header />

      <div className="product-page">
        <aside className="sidebar">
          <div className="filter-title">Bộ lọc</div>

          <div className="filter-box">
            <h3>Thương hiệu</h3>
            <label><input type="checkbox" /> Adidas</label>
            <label><input type="checkbox" /> CoolMate</label>
            <label><input type="checkbox" /> H&M</label>
            <label><input type="checkbox" /> Levi's</label>
            <label><input type="checkbox" /> Nike</label>
            <label><input type="checkbox" /> Owen</label>
            <label><input type="checkbox" /> Puma</label>
          </div>

          <div className="filter-box">
            <h3>Khoảng giá</h3>
            <label><input type="checkbox" /> Tất cả</label>
            <label><input type="checkbox" /> Dưới 1.000.000đ</label>
            <label><input type="checkbox" /> 1.000.000đ - 2.000.000đ</label>
            <label><input type="checkbox" /> 2.000.000đ - 3.000.000đ</label>
            <label><input type="checkbox" /> Trên 3.000.000đ</label>
          </div>

          <div className="filter-box">
            <h3>Giới tính</h3>
            <label><input type="checkbox" /> Tất cả</label>
            <label><input type="checkbox" /> Nam</label>
            <label><input type="checkbox" /> Nữ</label>
            <label><input type="checkbox" /> Trẻ em</label>
            <label><input type="checkbox" /> Unisex</label>
          </div>
        </aside>

        <section className="product-content">
          <div className="top-bar">
            <h2>Túi</h2>
            <select>
              <option>Mặc định</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
              <option>Mới nhất</option>
            </select>
          </div>

          <div className="breadcrumb">
            <span>Trang chủ</span>
            <span className="arrow"> &gt; </span>
            <span className="active">Túi</span>
          </div>

          <div className="shop-product-grid">
            {tuiProducts.length > 0 ? (
              tuiProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>Không có sản phẩm nào thuộc danh mục Túi.</p>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}