import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({
  product,
  badgeText = "",
  showBuyNow = false,
}) {
  if (!product) return null;

  const defaultImage =
    product.thumbnail ||
    product.image ||
    null;

  const swatchColors = {
    đen: "#111111",
    black: "#111111",
    trắng: "#ffffff",
    white: "#ffffff",
    xám: "#a9a9a9",
    gray: "#a9a9a9",
    đỏ: "#dc2626",
    red: "#dc2626",
    xanh: "#2563eb",
    blue: "#2563eb",
  };

  const uniqueVariants = Array.from(
    new Map(
      (product.variants || [])
        .filter((variant) => variant.color)
        .map((variant) => [variant.color, variant])
    ).values()
  );

  const productColors = uniqueVariants.length
    ? uniqueVariants.map((variant) => ({
        id: String(variant.id),
        name: variant.color,
        color:
          swatchColors[String(variant.color).toLowerCase()] ||
          "#d1d5db",
        image: variant.image_url || variant.image || defaultImage,
      }))
    : [
        {
          id: "default",
          name: "Mặc định",
          color: "#111111",
          image: defaultImage,
        },
      ];

  const [selectedColor, setSelectedColor] =
    useState(productColors[0]);

  const regularPrice = Number(product.price || 0);
  const isOnSale = Boolean(product.is_on_sale);
  const price = Number(
    product.current_price ||
    (isOnSale ? product.sale_price : product.price) ||
    0
  );

  const oldPrice = isOnSale
    ? regularPrice
    : Number(
        product.old_price ||
        product.original_price ||
        product.compare_price ||
        0
      );

  const brand =
    product.brand?.name ||
    product.brand_name ||
    product.brand ||
    "";

  const promoText =
    product.promotion_text ||
    product.promotion ||
    "";

  const hasDiscount =
    oldPrice > 0 && oldPrice > price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((oldPrice - price) / oldPrice) * 100
      )
    : null;

  const handleColorClick = (event, color) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedColor(color);
  };

  return (
    <article className="ash-product-card">

      <Link
        to={`/product/${product.id}`}
        className="ash-product-card-link"
      >

        {/* ================= IMAGE ================= */}

        <div className="ash-product-image-area">

          <div className="ash-product-labels">

            {badgeText && (
              <span className="ash-product-label">
                {badgeText}
              </span>
            )}

            {promoText && (
              <span className="ash-product-label">
                {promoText}
              </span>
            )}

            {discountPercent && (
              <span className="ash-product-label">
                -{discountPercent}%
              </span>
            )}

          </div>


          {/* CÓ HÌNH */}

          {selectedColor.image ? (
            <img
              src={selectedColor.image}
              alt={product.name || "Sản phẩm"}
              className="ash-product-image"
            />
          ) : (

            /* CHƯA CÓ HÌNH */

            <div className="ash-product-no-image">
              <span>CHƯA CÓ HÌNH</span>
            </div>

          )}

        </div>


        {/* ================= INFO ================= */}

        <div className="ash-product-info">

          {brand && (
            <div className="ash-product-brand">
              {brand}
            </div>
          )}

          <h3 className="ash-product-name">
            {product.name}
          </h3>


          {/* ================= PRICE ================= */}

          <div className="ash-product-price-row">

            <span className="ash-product-price">
              {price.toLocaleString("vi-VN")} đ
            </span>

            {hasDiscount && (
              <span className="ash-product-old-price">
                {oldPrice.toLocaleString("vi-VN")} đ
              </span>
            )}

          </div>


          {/* ================= COLORS ================= */}

          <div className="ash-product-colors">

            {productColors.map((item) => (

              <button
                key={item.id}
                type="button"

                className={`ash-product-color-button ${
                  selectedColor.id === item.id
                    ? "active"
                    : ""
                }`}

                onClick={(event) =>
                  handleColorClick(event, item)
                }

                aria-label={`Chọn màu ${item.name}`}
              >

                <span
                  className="ash-product-color"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

              </button>

            ))}

          </div>


          {/* ================= BUY NOW ================= */}

          {showBuyNow && (
            <span className="ash-product-buy-now">
              MUA NGAY
            </span>
          )}

        </div>

      </Link>

    </article>
  );
}
