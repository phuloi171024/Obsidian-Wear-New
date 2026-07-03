import "./ProductCard.css";

export default function ProductCard({ product }) {
  return (
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
  );
}
