import Footer from "../components/Footer";
import { useQuickAdd } from "../components/QuickAddProvider";
import "./CartPage.css";
import {
  FiArrowRight,
  FiHeart,
  FiLock,
  FiMinus,
  FiPlus,
  FiTag,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { productService } from "../services/productService";
import { apiUrl } from "../config/api";

const money = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} đ`;

const getProductImage = (product) =>
  product?.thumbnail ||
  product?.images?.[0]?.image_url ||
  product?.images?.[0]?.image_path ||
  "/images/placeholder.png";


const RECOMMEND_COLOR_MAP = {
  đen: "#111111",
  trắng: "#ffffff",
  xám: "#9ca3af",
  "xám nhạt": "#d1d5db",
  "xám đậm": "#4b5563",

  đỏ: "#dc2626",
  "đỏ đô": "#7f1d1d",

  xanh: "#2563eb",
  "xanh dương": "#2563eb",
  "xanh da trời": "#38bdf8",
  "xanh ngọc": "#14b8a6",
  "xanh navy": "#172554",
  "xanh lá": "#16a34a",
  "xanh rêu": "#4d5d3d",

  hồng: "#ec4899",
  "hồng nhạt": "#f9a8d4",
  "hồng fuchsia": "#c026d3",
  "hồng tím": "#db2777",

  tím: "#9333ea",
  "tím nhạt": "#c4b5fd",

  vàng: "#eab308",
  cam: "#f97316",
  nâu: "#8b5e3c",
  be: "#d6c4a7",
  bạc: "#c0c0c0",
};
const RECOMMEND_COLOR_ALIASES = [
  { names: ["black", "đen"], color: "#111111" },
  { names: ["white", "trắng"], color: "#ffffff" },
  { names: ["grey", "gray", "xám"], color: "#9ca3af" },

  { names: ["red", "đỏ", "university red"], color: "#dc2626" },
  { names: ["burgundy", "đỏ đô"], color: "#7f1d1d" },

  {
    names: ["blue", "xanh dương", "photo blue", "light blue"],
    color: "#2563eb",
  },
  {
    names: ["sky blue", "xanh da trời"],
    color: "#38bdf8",
  },
  {
    names: ["teal", "turquoise", "aqua", "xanh ngọc"],
    color: "#14b8a6",
  },
  {
    names: ["navy", "midnight navy", "xanh navy"],
    color: "#172554",
  },
  {
    names: ["green", "xanh lá"],
    color: "#16a34a",
  },

  {
    names: ["pink", "hồng", "playful pink", "cactus flower"],
    color: "#ec4899",
  },
  {
    names: ["fuchsia", "magenta", "hồng fuchsia"],
    color: "#c026d3",
  },
  {
    names: ["purple", "violet", "tím"],
    color: "#9333ea",
  },

  { names: ["yellow", "vàng"], color: "#eab308" },
  { names: ["orange", "cam"], color: "#f97316" },
  { names: ["brown", "nâu"], color: "#8b5e3c" },
  { names: ["beige", "cream", "be", "kem"], color: "#d6c4a7" },
  { names: ["silver", "bạc"], color: "#c0c0c0" },
];
const recommendNormalizeColor = (value) =>
  String(value || "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("vi-VN");

const recommendColorPartToCss = (part) => {
  const normalized = recommendNormalizeColor(part);

  // Nếu database lưu trực tiếp mã HEX
  if (/^#[0-9a-f]{3,8}$/i.test(normalized)) {
    return normalized;
  }

  // Ưu tiên tên khớp chính xác
  if (RECOMMEND_COLOR_MAP[normalized]) {
    return RECOMMEND_COLOR_MAP[normalized];
  }

  // Tìm theo từ khóa tiếng Việt, tiếng Anh và tên màu của hãng
  const alias = RECOMMEND_COLOR_ALIASES.find(({ names }) =>
    names.some((name) =>
      normalized.includes(recommendNormalizeColor(name))
    )
  );

  return alias?.color || "#d1d5db";
};

const recommendColorToBackground = (name) => {
  const parts = String(name || "")
    .split(/[\/,+&-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return recommendColorPartToCss(parts[0] || name);
  }

  const step = 100 / parts.length;

  return `conic-gradient(${parts
    .map((part, index) => {
      const start = Math.round(index * step);
      const end = Math.round((index + 1) * step);
      return `${recommendColorPartToCss(part)} ${start}% ${end}%`;
    })
    .join(", ")})`;
};

const recommendUniqueColors = (variants = []) => {
  const map = new Map();

  variants.forEach((variant) => {
    const color = String(variant?.color || "").trim();
    const colorKey = recommendNormalizeColor(color);

    if (colorKey && !map.has(colorKey)) {
      map.set(colorKey, { color, variant });
    }
  });

  return [...map.values()];
};

const recommendCouponActive = (coupon) => {
  if (!coupon) return false;
  if (
    coupon.status === 0 ||
    coupon.status === false ||
    coupon.status === "0"
  ) {
    return false;
  }

  if (
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    Number(coupon.used_count || 0) >= Number(coupon.usage_limit)
  ) {
    return false;
  }

  if (
    coupon.expires_at &&
    new Date(coupon.expires_at) < new Date()
  ) {
    return false;
  }

  return true;
};

const recommendCompactMoney = (value) => {
  const amount = Number(value || 0);

  if (amount >= 1000 && amount % 1000 === 0) {
    return `${amount / 1000}K`;
  }

  return `${amount.toLocaleString("vi-VN")}Đ`;
};

const getRecommendationPromotion = (product, coupons = []) => {
  const price = Number(product?.price || 0);
  if (!price) return null;

  const eligible = coupons
    .filter((coupon) => coupon?.discount_type !== "shipping")
    .filter(recommendCouponActive)
    .filter(
      (coupon) =>
        price >= Number(coupon.min_order_value || 0)
    )
    .map((coupon) => {
      const value = Number(coupon.discount_value || 0);
      const actualDiscount =
        coupon.discount_type === "percent"
          ? (price * value) / 100
          : value;

      return { coupon, actualDiscount };
    })
    .sort(
      (a, b) =>
        b.actualDiscount - a.actualDiscount
    );

  const best = eligible[0]?.coupon;
  if (!best) return null;

  const value = Number(best.discount_value || 0);
  const discountText =
    best.discount_type === "percent"
      ? `${value}%`
      : recommendCompactMoney(value);

  return {
    yellow: `MÃ ${best.code} - GIẢM ${discountText}`,
    red:
      best.discount_type === "percent"
        ? `-${value}%`
        : `-${recommendCompactMoney(value)}`,
  };
};

const recommendationPaletteCache = new Map();

const recommendationRgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Number(value)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

const extractRecommendationMainColor = (imageUrl) =>
  new Promise((resolve) => {
    if (!imageUrl) {
      resolve("#d1d5db");
      return;
    }

    if (recommendationPaletteCache.has(imageUrl)) {
      resolve(recommendationPaletteCache.get(imageUrl));
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        });
        const sampleSize = 28;

        canvas.width = sampleSize;
        canvas.height = sampleSize;
        context.drawImage(
          image,
          0,
          0,
          sampleSize,
          sampleSize
        );

        const { data } = context.getImageData(
          0,
          0,
          sampleSize,
          sampleSize
        );

        const buckets = new Map();

        for (
          let index = 0;
          index < data.length;
          index += 16
        ) {
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          if (a < 200) continue;

          const brightness = (r + g + b) / 3;
          if (brightness > 245) continue;

          const quantR =
            Math.min(255, Math.round(r / 32) * 32);
          const quantG =
            Math.min(255, Math.round(g / 32) * 32);
          const quantB =
            Math.min(255, Math.round(b / 32) * 32);

          const hex = recommendationRgbToHex(
            quantR,
            quantG,
            quantB
          );

          buckets.set(
            hex,
            (buckets.get(hex) || 0) + 1
          );
        }

        const mainColor =
          [...buckets.entries()].sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0] || "#d1d5db";

        recommendationPaletteCache.set(
          imageUrl,
          mainColor
        );

        resolve(mainColor);
      } catch {
        resolve("#d1d5db");
      }
    };

    image.onerror = () => resolve("#d1d5db");
    image.src = imageUrl;
  });

function CartRecommendationCard({
  product,
  coupons,
  onNavigate,
  onQuickAdd,
}) {
  const colorVariants = useMemo(
    () => recommendUniqueColors(product?.variants || []),
    [product]
  );

  const [fallbackColor, setFallbackColor] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    colorVariants[0]?.color || ""
  );

  const imageUrl = getProductImage(product);

  const firstColor = colorVariants[0]?.color || "";

  const selectedColorEntry =
    colorVariants.find(
      (item) => item.color === selectedColor
    ) || null;

  const selectedVariantImage =
    selectedColorEntry?.variant?.image ||
    selectedColorEntry?.variant?.image_url ||
    "";

  const isFirstColor =
    !selectedColor ||
    selectedColor === firstColor;

  /*
    Màu đầu tiên giữ nguyên ảnh chính.
    Từ màu thứ 2 trở đi:
    - Có ảnh variant => hiện ảnh variant.
    - Chưa có ảnh => hiện "Chưa có hình".
  */
  const showMissingColorImage =
    colorVariants.length > 1 &&
    !isFirstColor &&
    !selectedVariantImage;

  const displayImage =
    isFirstColor
      ? imageUrl
      : selectedVariantImage || imageUrl;

  useEffect(() => {
    setSelectedColor(colorVariants[0]?.color || "");
  }, [product?.id]);

  useEffect(() => {
    let mounted = true;

    if (colorVariants.length > 0) {
      setFallbackColor("");
      return () => {
        mounted = false;
      };
    }

    extractRecommendationMainColor(imageUrl).then((color) => {
      if (mounted) {
        setFallbackColor(color || "#d1d5db");
      }
    });

    return () => {
      mounted = false;
    };
  }, [imageUrl, colorVariants.length, product?.id]);

  const promotion = getRecommendationPromotion(
    product,
    coupons
  );

  const brandName =
    product?.brand?.name ||
    product?.brand_name ||
    (typeof product?.brand === "string"
      ? product.brand
      : "");

  const goProduct = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onNavigate(`/product/${product.id}`);
  };

  const openQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onQuickAdd(product, selectedColor);
  };

  return (
    <article className="ash-cart-recommend-card">
      <Link
        to={`/product/${product.id}`}
        className="ash-cart-recommend-link"
      >
        <div className="ash-cart-recommend-image">
          {promotion && (
            <div className="ash-cart-recommend-promo">
              <span className="ash-cart-recommend-promo-yellow">
                {promotion.yellow}
              </span>

              <span className="ash-cart-recommend-promo-red">
                {promotion.red}
              </span>
            </div>
          )}

          {showMissingColorImage ? (
            <div className="ash-cart-recommend-missing-image">
              <span>Chưa có hình</span>
            </div>
          ) : (
            <img
              src={displayImage}
              alt={product.name}
            />
          )}

          <button
            type="button"
            className="ash-cart-recommend-wishlist"
            aria-label="Yêu thích"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <FiHeart size={21} />
          </button>

          <div className="ash-cart-recommend-actions">
            <button
              type="button"
              onClick={openQuickAdd}
            >
              Thêm giỏ
            </button>

            <button
              type="button"
              onClick={goProduct}
            >
              Mua ngay
            </button>
          </div>
        </div>

        <div className="ash-cart-recommend-info">
          {brandName && (
            <div className="ash-cart-recommend-brand">
              {brandName}
            </div>
          )}

          <h3>{product.name}</h3>

          <div className="ash-cart-recommend-price">
            {money(product.price)}
          </div>

          {(colorVariants.length > 0 || fallbackColor) && (
            <div
              className="ash-cart-recommend-colors"
              aria-label="Màu sản phẩm"
            >
              {colorVariants.length > 0 ? (
                colorVariants.map((item) => (
                  <button
                    type="button"
                    key={item.color}
                    title={item.color}
                    aria-label={`Màu ${item.color}`}
                    className={`ash-cart-recommend-color-dot ${
                      selectedColor === item.color
                        ? "active"
                        : ""
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedColor(item.color);
                    }}
                  >
                    <span
                      style={{
                        background:
                          recommendColorToBackground(
                            item.color
                          ),
                      }}
                    />
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  className="ash-cart-recommend-color-dot ash-cart-recommend-color-dot--static"
                  title="Màu tham khảo từ ảnh sản phẩm"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <span
                    style={{
                      background: fallbackColor,
                    }}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { openQuickAdd } = useQuickAdd();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherTab, setVoucherTab] = useState("product");
  const [inputVoucher, setInputVoucher] = useState("");
  const [dbCoupons, setDbCoupons] = useState([]);
  const [appliedProductVoucher, setAppliedProductVoucher] = useState(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [productCatalog, setProductCatalog] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token?.trim()}`,
    };
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl("cart"), {
        headers: getHeaders(),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCartItems(Array.isArray(data.data) ? data.data : []);
      } else if (res.status === 401) {
        navigate("/login");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    const savedVouchers = JSON.parse(localStorage.getItem("applied_vouchers") || "null");
    if (savedVouchers?.product) setAppliedProductVoucher(savedVouchers.product);
    if (savedVouchers?.shipping) setAppliedShippingVoucher(savedVouchers.shipping);

  }, [navigate]);

  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCart();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await productService.getProducts({ sort: "default" });

        if (Array.isArray(data)) {
          // Giữ toàn bộ catalog để bổ sung brand cho item trong giỏ.
          // API /cart hiện có thể không trả relation brand của product.
          setProductCatalog(data);
          setRecommendations(data.slice(0, 10));
        }
      } catch (error) {
        setProductCatalog([]);
        setRecommendations([]);
      }
    };

    loadRecommendations();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(apiUrl("coupons"), {
        headers: getHeaders(),
      });
      const data = await res.json();

      const couponList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      if (res.ok && couponList.length > 0) {
        const now = new Date();

        const validCoupons = couponList.filter((coupon) => {
          if (
            coupon.status === 0 ||
            coupon.status === false ||
            coupon.status === "0"
          ) {
            return false;
          }

          if (
            coupon.usage_limit !== null &&
            coupon.usage_limit !== undefined &&
            Number(coupon.used_count || 0) >=
              Number(coupon.usage_limit)
          ) {
            return false;
          }

          if (
            coupon.expires_at &&
            new Date(coupon.expires_at) < now
          ) {
            return false;
          }

          return true;
        });

        if (validCoupons.length > 0) {
          setDbCoupons(validCoupons);
        }
      }
    } catch (error) {
      console.error("Không thể tải danh sách mã giảm giá");
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch(apiUrl(`cart/update/${id}`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCartItems((prev) =>
          prev.map((item) => (item.id === id ? data.data : item)),
        );
        return;
      }
      toast.error(data.message || "Không thể cập nhật số lượng");
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ");
    }
  };

  const promptRemove = (id) => {
    setItemToDelete(id);
    setShowModal(true);
  };

  const confirmRemove = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(
        apiUrl(`cart/remove/${itemToDelete}`),
        { method: "DELETE", headers: getHeaders() },
      );
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemToDelete));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        if (cartItems.length === 1) {
          setAppliedProductVoucher(null);
          setAppliedShippingVoucher(null);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setShowModal(false);
      setItemToDelete(null);
    }
  };

  const resolveCartProduct = (cartProduct) => {
    if (!cartProduct) return null;

    const fullProduct = productCatalog.find(
      (item) => Number(item?.id) === Number(cartProduct?.id)
    );

    if (!fullProduct) return cartProduct;

    /*
      Product từ API giỏ hàng có thể thiếu brand.
      Merge với product đầy đủ từ /products để lấy đúng Nike/Puma/Adidas...
      nhưng vẫn ưu tiên dữ liệu cart hiện tại.
    */
    return {
      ...fullProduct,
      ...cartProduct,
      brand: cartProduct?.brand || fullProduct?.brand || null,
      brand_name:
        cartProduct?.brand_name ||
        fullProduct?.brand_name ||
        fullProduct?.brand?.name ||
        "",
    };
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const product = item.product_variant?.product;
        const price = Number(product?.current_price ?? product?.price ?? 0);
        return sum + price * item.quantity;
      }, 0),
    [cartItems],
  );

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems],
  );

  const productDiscount = appliedProductVoucher
    ? Number(appliedProductVoucher.discount_amount || 0)
    : 0;
  const estimatedTotal = Math.max(0, subtotal - productDiscount);

  const shippingProgress = Math.min(100, (subtotal / 3399000) * 100);
  const remainingForFreeShip = Math.max(0, 3399000 - subtotal);

  const handleApplyCoupon = async () => {
    if (!inputVoucher.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      setIsApplying(true);
      const res = await fetch(apiUrl("coupons/apply"), {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          code: inputVoucher,
          shipping_method: "economy",
          province: "",
          product_coupon_id: appliedProductVoucher?.id || null,
          shipping_coupon_id: appliedShippingVoucher?.id || null,
        }),
      });
      const data = await res.json();

      if (res.ok && (data.status || data.success)) {
        toast.success(data.message);
        const couponData = data.data;
        if (couponData.type === "shipping") {
          setAppliedShippingVoucher(couponData);
        } else {
          setAppliedProductVoucher(couponData);
        }
        setInputVoucher("");
        setShowVoucherModal(false);
      } else {
        toast.error(data.message || "Mã giảm giá không hợp lệ!");
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ kiểm tra mã!");
    } finally {
      setIsApplying(false);
    }
  };

  const handleProceedToCheckout = () => {
    localStorage.setItem(
      "applied_vouchers",
      JSON.stringify({
        product: appliedProductVoucher,
        shipping: appliedShippingVoucher,
      }),
    );

    navigate("/shipping-info");
  };

  const cartProductIds = new Set(
    cartItems.map((item) => Number(item.product_variant?.product?.id)).filter(Boolean),
  );
  const suggestedProducts = recommendations
    .filter((item) => !cartProductIds.has(Number(item.id)))
    .slice(0, 5);

  return (
    <>
      <Toaster position="top-right" />

      <main className="ash-cart-page">
        <section className="ash-cart-heading">
          <h1>GIỎ HÀNG</h1>
          <p>
            {subtotal >= 3399000
              ? "Bạn đủ điều kiện được miễn phí vận chuyển"
              : `Mua thêm ${money(remainingForFreeShip)} để được miễn phí vận chuyển`}
          </p>
          <div className="ash-shipping-progress" aria-hidden="true">
            <span style={{ width: `${shippingProgress}%` }} />
          </div>
        </section>

        <div className="ash-cart-layout">
          <section className="ash-cart-products">
            <div className="ash-cart-table-head">
              <span>SẢN PHẨM</span>
              <span>SỐ LƯỢNG</span>
              <span>TỔNG CỘNG</span>
            </div>

            {loading ? (
              <div className="ash-cart-state">Đang tải giỏ hàng...</div>
            ) : cartItems.length === 0 ? (
              <div className="ash-cart-state ash-cart-empty">
                <p>Giỏ hàng của bạn đang trống.</p>
                <button type="button" onClick={() => navigate("/products")}>MUA SẮM NGAY</button>
              </div>
            ) : (
              <div className="ash-cart-list">
                {cartItems.map((item) => {
                  const product = resolveCartProduct(
                    item.product_variant?.product
                  );
                  const unitPrice = Number(
                    product?.current_price ?? product?.price ?? 0
                  );
                  return (
                    <article className="ash-cart-item" key={item.id}>
                      <Link to={`/product/${product?.id}`} className="ash-cart-product-media">
                        <img
                          src={getProductImage(product)}
                          alt={product?.name || "Sản phẩm"}
                        />
                      </Link>

                      <div className="ash-cart-product-info">
                        <span className="ash-cart-brand">
                          {product?.brand?.name ||
                            product?.brand_name ||
                            (typeof product?.brand === "string"
                              ? product.brand
                              : "")}
                        </span>
                        <Link to={`/product/${product?.id}`} className="ash-cart-product-name">
                          {product?.name}
                        </Link>
                        <p>
                          {item.product_variant?.color || "Mặc định"} / {item.product_variant?.size || "Freesize"}
                        </p>
                        <strong>{money(unitPrice)}</strong>
                      </div>

                      <div className="ash-cart-quantity-wrap">
                        <div className="ash-cart-quantity">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Giảm số lượng"
                          >
                            <FiMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Tăng số lượng"
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="ash-cart-remove-link"
                          onClick={() => promptRemove(item.id)}
                        >
                          Bỏ
                        </button>
                      </div>

                      <div className="ash-cart-line-total">
                        <strong>{money(unitPrice * item.quantity)}</strong>

                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="ash-cart-summary">
            <div className="ash-cart-summary-top">
              <span>TẠM TÍNH</span>
              <strong>{money(estimatedTotal)}</strong>
            </div>

            <p className="ash-cart-tax-note">
              Vận chuyển và các khoản thuế sẽ được tính khi thanh toán.
            </p>

            {productDiscount > 0 && (
              <div className="ash-cart-discount-row">
                <span>Giảm giá ({appliedProductVoucher?.code})</span>
                <b>-{money(productDiscount)}</b>
              </div>
            )}

            {appliedShippingVoucher && (
              <div className="ash-cart-discount-row">
                <span>Voucher vận chuyển ({appliedShippingVoucher.code})</span>
                <b>Áp dụng khi thanh toán</b>
              </div>
            )}

            <button
              type="button"
              className="ash-cart-voucher-link"
              onClick={() => {
                setShowVoucherModal(true);
                fetchCoupons();
              }}
            >
              <FiTag />
              {appliedProductVoucher || appliedShippingVoucher
                ? "Mã ưu đãi đã áp dụng"
                : "Thêm mã ưu đãi"}
            </button>

            <button
              type="button"
              className="ash-cart-checkout"
              onClick={handleProceedToCheckout}
              disabled={cartItems.length === 0}
            >
              <FiLock />
              <span>TIẾN HÀNH THANH TOÁN</span>
              <FiArrowRight className="ash-cart-checkout-arrow" />
            </button>
          </aside>
        </div>

        {suggestedProducts.length > 0 && (
          <section className="ash-cart-recommendations">
            <h2>BẠN CŨNG CÓ THỂ QUAN TÂM</h2>

            <div className="ash-cart-recommend-grid">
              {suggestedProducts.map((product) => (
                <CartRecommendationCard
                  key={product.id}
                  product={product}
                  coupons={dbCoupons}
                  onNavigate={navigate}
                  onQuickAdd={openQuickAdd}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {showVoucherModal && (
        <div className="voucher-modal-overlay">
          <div className="voucher-modal-box">
            <div className="voucher-modal-header">
              <h3>MÃ GIẢM GIÁ & ƯU ĐÃI</h3>
              <button className="close-btn" onClick={() => setShowVoucherModal(false)}>✕</button>
            </div>

            <div className="voucher-input-group">
              <input
                type="text"
                placeholder="Nhập mã giảm giá của bạn"
                value={inputVoucher}
                onChange={(e) => setInputVoucher(e.target.value)}
              />
              <button onClick={handleApplyCoupon} disabled={isApplying}>
                {isApplying ? "ĐANG KIỂM TRA..." : "ÁP DỤNG"}
              </button>
            </div>

            <div className="voucher-tabs">
              <button
                className={voucherTab === "product" ? "active" : ""}
                onClick={() => setVoucherTab("product")}
              >
                Ưu Đãi Cho Bạn
              </button>
              <button
                className={voucherTab === "shipping" ? "active" : ""}
                onClick={() => setVoucherTab("shipping")}
              >
                Ưu Đãi Vận Chuyển
              </button>
            </div>

            <div className="voucher-list-container">
              {dbCoupons
                .filter((coupon) =>
                  voucherTab === "shipping"
                    ? coupon.discount_type === "shipping"
                    : coupon.discount_type !== "shipping",
                )
                .map((coupon) => {
                  const isSelected =
                    voucherTab === "product"
                      ? appliedProductVoucher?.id === coupon.id
                      : appliedShippingVoucher?.id === coupon.id;

                  return (
                    <div
                      key={coupon.id}
                      className={`voucher-card ${isSelected ? "selected" : ""}`}
                    >
                      <div className="voucher-icon">%</div>
                      <div className="voucher-info">
                        <h4>
                          Mã: {coupon.code} - Giảm {Number(coupon.discount_value).toLocaleString("vi-VN")}{" "}
                          {coupon.discount_type === "percent" ? "%" : "đ"}
                        </h4>
                        <p>Đơn tối thiểu: {money(coupon.min_order_value)}</p>
                        <p>Hạn sử dụng: {coupon.expires_at || "Không thời hạn"}</p>
                      </div>
                      <div className="voucher-action">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const formattedCoupon = {
                              id: coupon.id,
                              code: coupon.code,
                              discount_value: Number(coupon.discount_value),
                              discount_amount:
                                coupon.discount_type === "shipping"
                                  ? 0
                                  : coupon.discount_type === "percent"
                                    ? Math.min(
                                        subtotal,
                                        subtotal * Number(coupon.discount_value || 0) / 100,
                                      )
                                    : Math.min(
                                        subtotal,
                                        Number(coupon.discount_value || 0),
                                      ),
                              type:
                                coupon.discount_type === "shipping"
                                  ? "shipping"
                                  : "product",
                            };

                            if (!isSelected && subtotal < Number(coupon.min_order_value)) {
                              toast.error(
                                `Đơn hàng chưa đạt tối thiểu ${money(coupon.min_order_value)}`,
                              );
                              return;
                            }

                            if (voucherTab === "product") {
                              setAppliedProductVoucher(isSelected ? null : formattedCoupon);
                            } else {
                              setAppliedShippingVoucher(isSelected ? null : formattedCoupon);
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

              {dbCoupons.length === 0 && (
                <p className="voucher-empty">Đang tải danh sách ưu đãi...</p>
              )}
            </div>

            <div className="voucher-modal-footer">
              <button className="confirm-voucher-btn" onClick={() => setShowVoucherModal(false)}>
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <h3>Xác nhận xóa sản phẩm</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?</p>
            <div className="custom-modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Hủy bỏ
              </button>
              <button className="btn-confirm" onClick={confirmRemove}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
