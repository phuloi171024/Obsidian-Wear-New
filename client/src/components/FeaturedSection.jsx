import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./FeaturedSection.css";

export default function FeaturedSection({
  products = [],
}) {
  const firstProducts = products.slice(0, 3);
  const secondProducts = products.slice(3, 5);

  return (
    <section className="ash-featured-section">
      <div className="ash-featured-inner">

        <div className="ash-featured-heading">
          <h2>--SẢN PHẨM NỔI BẬT--</h2>
        </div>


        {/* =================================================
            BLOCK 1
        ================================================== */}

        <div className="ash-featured-row">

          <Link
            to="/products"
            className="ash-featured-banner ash-featured-banner--one"
          >
            <div className="ash-featured-banner-overlay"></div>

            <div className="ash-featured-banner-content">
              <span className="ash-featured-small">
                NEW COLLECTION
              </span>

              <h3>
                PALLADIUM
                <br />
                X BEUTER
              </h3>

              <span className="ash-featured-explore">
                KHÁM PHÁ NGAY
              </span>
            </div>
          </Link>


          <div className="ash-featured-products ash-featured-products--three">
            {firstProducts.length > 0 ? (
              firstProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText="NEW ARRIVAL"
                  showBuyNow={true}
                />
              ))
            ) : (
              <div className="ash-featured-empty">
                Chưa có sản phẩm.
              </div>
            )}
          </div>

        </div>


        {/* =================================================
            BLOCK 2
        ================================================== */}

        <div className="ash-featured-row ash-featured-row--reverse">

          <div className="ash-featured-products ash-featured-products--two">
            {secondProducts.length > 0 ? (
              secondProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badgeText="SALE"
                  showBuyNow={true}
                />
              ))
            ) : (
              firstProducts.slice(0, 2).map((product) => (
                <ProductCard
                  key={`second-${product.id}`}
                  product={product}
                  badgeText="SALE"
                  showBuyNow={true}
                />
              ))
            )}
          </div>


          <Link
            to="/products"
            className="ash-featured-banner ash-featured-banner--two"
          >
            <div className="ash-featured-banner-overlay"></div>

            <div className="ash-featured-banner-content">
              <span className="ash-featured-small">
                PERFORMANCE
              </span>

              <h3>
                RUN
                <br />
                YOUR WAY
              </h3>

              <span className="ash-featured-explore">
                KHÁM PHÁ NGAY
              </span>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}