import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./DealSection.css";

export default function DealSection({ deals = [] }) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (activeTab >= deals.length) {
      setActiveTab(0);
    }
  }, [activeTab, deals.length]);

  const activeDeal = deals[activeTab] || null;
  const visibleProducts = activeDeal?.products || [];

  return (
    <section className="deal-section">
      <div className="deal-inner">
        <div className="deal-heading">
          <h2>--DEAL TỐT TRONG THÁNG--</h2>
        </div>

        <div className="deal-tabs">
          {deals.map((deal, index) => (
            <button
              key={deal.key}
              type="button"
              className={`deal-tab ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {deal.label}
            </button>
          ))}
        </div>

        <div className="deal-grid">
          {visibleProducts.length > 0 ? (
            visibleProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badgeText="SALE"
              />
            ))
          ) : (
            <div className="deal-empty">
              Hiện chưa có chương trình khuyến mãi đang hoạt động.
            </div>
          )}
        </div>

        {activeDeal && (
          <div className="deal-view-all-wrapper">
            <Link
              to={`/products?on_sale=1&deal_label=${encodeURIComponent(activeDeal.label)}`}
              className="deal-view-all"
            >
              XEM TẤT CẢ
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
