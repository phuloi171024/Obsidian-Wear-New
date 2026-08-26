import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./SportsSection.css";

export default function SportsSection({ sections = [] }) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (activeTab >= sections.length) {
      setActiveTab(0);
    }
  }, [activeTab, sections.length]);

  const activeSection = sections[activeTab] || null;
  const visibleProducts = activeSection?.products || [];

  return (
    <section className="sports-products-section">
      <div className="sports-products-inner">
        <div className="sports-products-heading">
          <h2>--CÁC BỘ MÔN THỂ THAO--</h2>
        </div>

        <div className="sports-tabs">
          {sections.map((section, index) => (
            <button
              key={section.key}
              type="button"
              className={`sports-tab ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="sports-products-grid">
          {visibleProducts.length > 0 ? (
            visibleProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="sports-products-empty">
              Chưa có sản phẩm cho bộ môn này.
            </div>
          )}
        </div>

        {activeSection && (
          <div className="sports-view-all-wrapper">
            <Link
              to={`/products?sport_type=${encodeURIComponent(activeSection.key)}`}
              className="sports-view-all"
            >
              XEM TẤT CẢ
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
