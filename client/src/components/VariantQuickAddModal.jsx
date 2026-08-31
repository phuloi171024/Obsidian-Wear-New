import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";
import "./VariantQuickAddModal.css";

const COLOR_SWATCHES = {
  đen: "#111111",
  black: "#111111",
  trắng: "#ffffff",
  white: "#ffffff",
  xám: "#a9a9a9",
  gray: "#a9a9a9",
  grey: "#a9a9a9",
  đỏ: "#dc2626",
  red: "#dc2626",
  xanh: "#2563eb",
  blue: "#2563eb",
  "xanh lá": "#16a34a",
  green: "#16a34a",
  vàng: "#eab308",
  yellow: "#eab308",
  cam: "#ea580c",
  orange: "#ea580c",
  tím: "#9333ea",
  purple: "#9333ea",
  hồng: "#ec4899",
  pink: "#ec4899",
  nâu: "#795548",
  brown: "#795548",
  be: "#d6c2a1",
  beige: "#d6c2a1",
};

const normalizeLabel = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");

const normalizeKey = (value) =>
  normalizeLabel(value).toLocaleLowerCase("vi-VN");

const getVariantImage = (variant) =>
  variant?.image_url || variant?.image || null;

const getProductImage = (product) =>
  product?.thumbnail ||
  product?.image ||
  product?.images?.[0]?.image_url ||
  product?.images?.[0]?.image_path ||
  "/images/placeholder.png";

const getCurrentPrice = (product) => {
  const regularPrice = Number(product?.price || 0);
  const salePrice = Number(product?.sale_price || 0);
  const isOnSale =
    Boolean(product?.is_on_sale) &&
    salePrice > 0 &&
    salePrice < regularPrice;

  return Number(
    product?.current_price ||
      (isOnSale ? salePrice : regularPrice) ||
      0
  );
};

export default function VariantQuickAddModal({
  open,
  product,
  initialColor = "",
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedColorKey, setSelectedColorKey] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product]
  );

  const colorOptions = useMemo(() => {
    const colors = new Map();

    variants.forEach((variant) => {
      const colorLabel = normalizeLabel(variant.color) || "Mặc định";
      const colorKey = normalizeKey(variant.color) || "__default__";

      if (!colors.has(colorKey)) {
        colors.set(colorKey, {
          key: colorKey,
          label: colorLabel,
          swatch:
            COLOR_SWATCHES[normalizeKey(variant.color)] || "#d1d5db",
          image: getVariantImage(variant),
        });
      } else if (!colors.get(colorKey).image) {
        colors.get(colorKey).image = getVariantImage(variant);
      }
    });

    return [...colors.values()];
  }, [variants]);

  useEffect(() => {
    if (!open || !product) {
      return;
    }

    const requestedColorKey = normalizeKey(initialColor);
    const requestedColorExists = colorOptions.some(
      (option) => option.key === requestedColorKey
    );
    const firstAvailableColor = colorOptions.find((option) =>
      variants.some(
        (variant) =>
          (normalizeKey(variant.color) || "__default__") === option.key &&
          Number(variant.stock || 0) > 0
      )
    );

    setSelectedColorKey(
      requestedColorExists
        ? requestedColorKey
        : firstAvailableColor?.key || colorOptions[0]?.key || ""
    );
    setSelectedSize("");
    setQuantity(1);
    setSubmitting(false);
  }, [open, product, initialColor, colorOptions, variants]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, submitting, onClose]);

  const variantsForSelectedColor = useMemo(() => {
    if (!selectedColorKey) {
      return [];
    }

    return variants.filter(
      (variant) =>
        (normalizeKey(variant.color) || "__default__") ===
        selectedColorKey
    );
  }, [variants, selectedColorKey]);

  const hasRealSizes = variantsForSelectedColor.some(
    (variant) => normalizeLabel(variant.size) !== ""
  );

  const sizeOptions = useMemo(() => {
    const sizes = new Map();

    variantsForSelectedColor.forEach((variant) => {
      const sizeLabel = normalizeLabel(variant.size);

      if (!sizeLabel) {
        return;
      }

      const sizeKey = normalizeKey(sizeLabel);
      const existing = sizes.get(sizeKey);
      const stock = Number(variant.stock || 0);

      if (!existing || stock > Number(existing.variant.stock || 0)) {
        sizes.set(sizeKey, {
          key: sizeKey,
          label: sizeLabel,
          variant,
        });
      }
    });

    return [...sizes.values()];
  }, [variantsForSelectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedColorKey) {
      return null;
    }

    if (!hasRealSizes) {
      return (
        variantsForSelectedColor.find(
          (variant) => Number(variant.stock || 0) > 0
        ) || variantsForSelectedColor[0] || null
      );
    }

    if (!selectedSize) {
      return null;
    }

    return (
      variantsForSelectedColor.find(
        (variant) => normalizeKey(variant.size) === selectedSize
      ) || null
    );
  }, [
    hasRealSizes,
    selectedColorKey,
    selectedSize,
    variantsForSelectedColor,
  ]);

  const selectedColor = colorOptions.find(
    (option) => option.key === selectedColorKey
  );
  const stock = Number(selectedVariant?.stock || 0);
  const displayedImage =
    getVariantImage(selectedVariant) ||
    selectedColor?.image ||
    getProductImage(product);

  const handleColorChange = (colorKey) => {
    setSelectedColorKey(colorKey);
    setSelectedSize("");
    setQuantity(1);
  };

  const handleQuantityChange = (nextQuantity) => {
    const maxQuantity = Math.max(stock, 1);
    setQuantity(Math.min(Math.max(nextQuantity, 1), maxQuantity));
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      onClose?.();
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (!selectedColorKey) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }

    if (hasRealSizes && !selectedSize) {
      toast.error("Vui lòng chọn kích thước!");
      return;
    }

    if (!selectedVariant) {
      toast.error("Không tìm thấy biến thể phù hợp!");
      return;
    }

    if (stock <= 0) {
      toast.error("Biến thể này đã hết hàng!");
      return;
    }

    if (quantity > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm trong kho.`);
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          product_variant_id: selectedVariant.id,
          quantity,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        toast.error("Phiên đăng nhập đã hết hạn!");
        onClose?.();
        navigate("/login", {
          state: { from: location.pathname },
        });
        return;
      }

      if (!response.ok || data.success === false || data.status === false) {
        toast.error(data.message || "Không thể thêm sản phẩm vào giỏ hàng!");
        return;
      }

      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: data.cart || data.data || null,
        })
      );
      window.dispatchEvent(new Event("cart:updated"));

      toast.success(data.message || "Đã thêm sản phẩm vào giỏ hàng!");
      onClose?.();

      navigate("/cart", {
        state: {
          addedVariantId: selectedVariant.id,
          addedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error("Quick add cart:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !product) {
    return null;
  }

  return (
    <div
      className="quick-add-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose?.();
        }
      }}
    >
      <section
        className="quick-add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
      >
        <button
          type="button"
          className="quick-add-close"
          onClick={onClose}
          disabled={submitting}
          aria-label="Đóng bảng chọn biến thể"
        >
          ×
        </button>

        <div className="quick-add-layout">
          <div className="quick-add-image-wrap">
            <img
              src={displayedImage}
              alt={product.name || "Sản phẩm"}
              className="quick-add-image"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/placeholder.png";
              }}
            />
          </div>

          <div className="quick-add-content">
            <p className="quick-add-brand">
              {product.brand?.name || product.brand_name || ""}
            </p>

            <h2 id="quick-add-title" className="quick-add-title">
              {product.name}
            </h2>

            <p className="quick-add-price">
              {getCurrentPrice(product).toLocaleString("vi-VN")} đ
            </p>

            {colorOptions.length > 0 && (
              <div className="quick-add-option-group">
                <div className="quick-add-option-heading">
                  <span>Màu sắc</span>
                  <strong>{selectedColor?.label || "Chưa chọn"}</strong>
                </div>

                <div className="quick-add-colors">
                  {colorOptions.map((option) => {
                    const colorStock = variants.some(
                      (variant) =>
                        (normalizeKey(variant.color) || "__default__") ===
                          option.key && Number(variant.stock || 0) > 0
                    );

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={`quick-add-color-button ${
                          selectedColorKey === option.key ? "active" : ""
                        } ${!colorStock ? "sold-out" : ""}`}
                        onClick={() => handleColorChange(option.key)}
                        disabled={!colorStock || submitting}
                        title={option.label}
                        aria-label={`Chọn màu ${option.label}`}
                      >
                        <span
                          className="quick-add-color-swatch"
                          style={{ backgroundColor: option.swatch }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasRealSizes && (
              <div className="quick-add-option-group">
                <div className="quick-add-option-heading">
                  <span>Kích thước</span>
                  <strong>
                    {sizeOptions.find((option) => option.key === selectedSize)
                      ?.label || "Chưa chọn"}
                  </strong>
                </div>

                <div className="quick-add-sizes">
                  {sizeOptions.map((option) => {
                    const optionStock = Number(option.variant.stock || 0);

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={`quick-add-size-button ${
                          selectedSize === option.key ? "active" : ""
                        } ${optionStock <= 0 ? "sold-out" : ""}`}
                        onClick={() => {
                          setSelectedSize(option.key);
                          setQuantity(1);
                        }}
                        disabled={optionStock <= 0 || submitting}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="quick-add-option-group">
              <div className="quick-add-option-heading">
                <span>Số lượng</span>
                <strong>
                  {selectedVariant
                    ? stock > 0
                      ? `Còn ${stock} sản phẩm`
                      : "Hết hàng"
                    : " "}
                </strong>
              </div>

              <div className="quick-add-quantity">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || submitting}
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!selectedVariant || quantity >= stock || submitting}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="quick-add-submit"
              onClick={handleAddToCart}
              disabled={submitting || !selectedVariant || stock <= 0}
            >
              {submitting ? "ĐANG THÊM..." : "THÊM VÀO GIỎ HÀNG"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
