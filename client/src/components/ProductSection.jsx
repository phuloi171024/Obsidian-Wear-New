import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./ProductSection.css";

export default function ProductSection({
  title,
  products,
  type = "default",
}) {
  let badgeText = "";

  if (type === "new") {
    badgeText = "NEW";
  }

  if (type === "featured") {
    badgeText = "HOT";
  }

  return (
    <section
      className={`ash-product-section ash-product-section--${type}`}
    >
      <div className="ash-product-inner">

        <div className="ash-section-heading">
          <h2 className="ash-section-title">
            --{title}--
          </h2>
        </div>

        <div className="ash-product-grid">
          {products && products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badgeText={badgeText}
              />
            ))
          ) : (
            <div className="ash-product-loading">
              Đang tải sản phẩm...
            </div>
          )}
        </div>

        <div className="ash-view-all-wrapper">
          <Link
            to="/products"
            className="ash-view-all"
          >
            XEM TẤT CẢ
          </Link>
        </div>

      </div>
    </section>
  );
}