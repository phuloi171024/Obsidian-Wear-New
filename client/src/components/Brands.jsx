import { Link } from "react-router-dom";
import "./Brands.css";

export default function Brands({ brands = [] }) {
  return (
    <section className="ash-brands-section">
      <div className="ash-brands-container">
        <div className="ash-brands-heading">
          <h2>--THƯƠNG HIỆU NỔI TIẾNG--</h2>
          <p>Khám phá những thương hiệu được yêu thích</p>
        </div>

        <div className="ash-brands-grid">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <Link
                className="ash-brand-item"
                key={brand.id}
                to={`/products?brand_id=${brand.id}`}
                aria-label={`Xem sản phẩm ${brand.name}`}
              >
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} />
                ) : (
                  <strong>{brand.name}</strong>
                )}
              </Link>
            ))
          ) : (
            <div>Chưa có thương hiệu nổi bật.</div>
          )}
        </div>
      </div>
    </section>
  );
}
