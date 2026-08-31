import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuickAdd } from "./QuickAddProvider";
import "./ProductCard.css";

const normalizeColorLabel = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");

const normalizeColorKey = (value) =>
  normalizeColorLabel(value).toLocaleLowerCase("vi-VN");

export default function ProductCard({
  product,
  badgeText = "",
  showBuyNow = false,
  onQuickAdd,
}) {
  const { openQuickAdd } = useQuickAdd();
  const quickAdd = onQuickAdd || openQuickAdd;

  const defaultImage =
    product?.thumbnail ||
    product?.image ||
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
      (product?.variants || [])
        .filter((variant) => variant.color)
        .map((variant) => [normalizeColorKey(variant.color), variant])
    ).values()
  );

  const productColors = uniqueVariants.length
    ? uniqueVariants.map((variant) => ({
        id: String(variant.id),
        name: normalizeColorLabel(variant.color),
        color:
          swatchColors[normalizeColorKey(variant.color)] ||
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

  const regularPrice = Number(product?.price || 0);
  const isOnSale = Boolean(product?.is_on_sale);
  const price = Number(
    product?.current_price ||
    (isOnSale ? product?.sale_price : product?.price) ||
    0
  );

  const oldPrice = isOnSale
    ? regularPrice
    : Number(
        product?.old_price ||
        product?.original_price ||
        product?.compare_price ||
        0
      );

  const brand =
    product?.brand?.name ||
    product?.brand_name ||
    product?.brand ||
    "";

  const promoText =
    product?.promotion_text ||
    product?.promotion ||
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

  const handleQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    quickAdd(product, selectedColor?.name || "");
  };

  if (!product) return null;

  return (
    <article className="ash-product-card">
      <div className="ash-product-image-area">
        <div className="ash-product-labels">
          {badgeText && (
            <span className="ash-product-label">{badgeText}</span>
          )}

          {promoText && (
            <span className="ash-product-label">{promoText}</span>
          )}

          {discountPercent && (
            <span className="ash-product-label">-{discountPercent}%</span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="ash-product-image-link"
          aria-label={`Xem chi tiết ${product.name}`}
        >
          {selectedColor.image ? (
            <img
              src={selectedColor.image}
              alt={product.name || "Sản phẩm"}
              className="ash-product-image"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/placeholder.png";
              }}
            />
          ) : (
            <div className="ash-product-no-image">
              <span>CHƯA CÓ HÌNH</span>
            </div>
          )}
        </Link>

        {quickAdd && (
          <div className="ash-product-quick-actions">
            <button
              type="button"
              className="ash-product-quick-add"
              onClick={handleQuickAdd}
            >
              THÊM GIỎ
            </button>

            <Link
              to={`/product/${product.id}`}
              className="ash-product-quick-buy"
            >
              MUA NGAY
            </Link>
          </div>
        )}
      </div>

      <div className="ash-product-info">
        <Link
          to={`/product/${product.id}`}
          className="ash-product-card-link"
        >
          {brand && <div className="ash-product-brand">{brand}</div>}

          <h3 className="ash-product-name">{product.name}</h3>

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
        </Link>

        <div className="ash-product-colors">
          {productColors.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ash-product-color-button ${
                selectedColor.id === item.id ? "active" : ""
              }`}
              onClick={(event) => handleColorClick(event, item)}
              aria-label={`Chọn màu ${item.name}`}
            >
              <span
                className="ash-product-color"
                style={{ backgroundColor: item.color }}
              />
            </button>
          ))}
        </div>

        {showBuyNow && !quickAdd && (
          <Link
            to={`/product/${product.id}`}
            className="ash-product-buy-now"
          >
            MUA NGAY
          </Link>
        )}
      </div>
    </article>
  );
}
