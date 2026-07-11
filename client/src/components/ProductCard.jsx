import "./ProductCard.css";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="product-card">
        <img src={product.image} alt={product.name} />

        <h3>{product.name}</h3>

        <div className="rating">
          ★★★★★ <span>({product.rating})</span>
        </div>

        <div className="price-cart">
          <span className="price">{product.price}</span>

          <button className="cart-btn">
            <i className="fa-solid fa-cart-shopping"></i>
          </button>
        </div>
      </div>
    </Link>
  );
}
