import { Link } from "react-router-dom";

export default function ProductCard({ product, badgeText }) {
  if (!product) return null;

  return (
    <div className="product-card-item" style={{ position: "relative" }}>
      
      {/* Nhãn HOT hoặc Mới */}
      {badgeText && (
        <div style={{
          position: "absolute", 
          top: "12px", 
          left: "12px",
          background: badgeText === "HOT" ? "#ef4444" : "#10b981",
          color: "#fff", 
          padding: "4px 12px", 
          borderRadius: "4px",
          fontSize: "12px", 
          fontWeight: "bold", 
          zIndex: 10,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          {badgeText}
        </div>
      )}

      {/* Bấm vào ảnh chuyển sang trang chi tiết */}
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
        <Link to={`/product/${product.id}`} className="card-add-cart-btn" style={{ textAlign: "center", textDecoration: "none", width: "100%" }}>
          🛒 Chọn tùy chọn
        </Link>
      </div>
    </div>
  );
}