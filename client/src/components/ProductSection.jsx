import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

export default function ProductSection({ title, products }) {
  // Tự động gán nhãn Mới hoặc HOT dựa vào Tiêu đề
  let badgeText = "";
  if (title && title.toLowerCase().includes("mới")) {
    badgeText = "Mới";
  } else if (title && title.toLowerCase().includes("bán chạy")) {
    badgeText = "HOT";
  }

  return (
    <section className="product-section" style={{ maxWidth: "1200px", margin: "50px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        
        <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0, textTransform: "uppercase", color: "#111827" }}>
            {title}
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>Khám phá những sản phẩm được yêu thích nhất</p>
        </div>

        {/* Nút Xem tất cả ĐÃ ĐƯỢC SỬA để bấm sang trang danh sách */}
        <Link to="/products" style={{ color: "#3563ff", textDecoration: "none", fontWeight: "600", fontSize: "15px", transition: "0.2s" }}>
          Xem tất cả &rarr;
        </Link>
      </div>

      <div className="shop-product-grid">
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} badgeText={badgeText} />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#777", width: "100%", gridColumn: "1 / -1", padding: "30px 0" }}>
            Đang tải sản phẩm...
          </p>
        )}
      </div>
    </section>
  );
}