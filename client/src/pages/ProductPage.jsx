import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ProductPage.css";
import Footer from "../components/Footer";
import { useQuickAdd } from "../components/QuickAddProvider";
import { productService } from "../services/productService";
import { API_BASE_URL } from "../config/api";
import toast, { Toaster } from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

const COLOR_MAP = {
  "đen": "#111111",
  "trắng": "#ffffff",
  "xám": "#9ca3af",
  "xám đậm": "#4b5563",
  "đỏ": "#dc2626",
  "xanh": "#2563eb",
  "xanh navy": "#172554",
  "xanh rêu": "#4d5d3d",
  "xanh lá": "#16a34a",
  "vàng": "#eab308",
  "cam": "#f97316",
  "hồng": "#ec4899",
  "tím": "#9333ea",
  "tím nhạt": "#c4b5fd",
  "nâu": "#8b5e3c",
  "be": "#d6c4a7",
  "bạc": "#c0c0c0",
};

const cleanColorLabel = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");

const normalizeColor = (value) =>
  cleanColorLabel(value).toLocaleLowerCase("vi-VN");

const colorPartToCss = (part) => COLOR_MAP[normalizeColor(part)] || "#d1d5db";

const colorToBackground = (name) => {
  const parts = String(name || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) return colorPartToCss(parts[0] || name);

  const step = 100 / parts.length;
  const stops = parts
    .map((part, index) => {
      const start = Math.round(index * step);
      const end = Math.round((index + 1) * step);
      return `${colorPartToCss(part)} ${start}% ${end}%`;
    })
    .join(", ");

  return `conic-gradient(${stops})`;
};


const paletteCache = new Map();

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Number(value)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

const extractMainColorFromImage = (imageUrl) =>
  new Promise((resolve) => {
    if (!imageUrl) {
      resolve("#d1d5db");
      return;
    }

    if (paletteCache.has(imageUrl)) {
      resolve(paletteCache.get(imageUrl));
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        const sampleSize = 30;

        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(
          image,
          0,
          0,
          sampleSize,
          sampleSize
        );

        const { data } =
          ctx.getImageData(
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

          if (a < 200) {
            continue;
          }

          const brightness =
            (r + g + b) / 3;

          /*
            Bỏ gần trắng để tránh lấy nền ảnh
            thay vì màu sản phẩm.
          */
          if (brightness > 245) {
            continue;
          }

          const quantR =
            Math.min(
              255,
              Math.round(r / 32) * 32
            );

          const quantG =
            Math.min(
              255,
              Math.round(g / 32) * 32
            );

          const quantB =
            Math.min(
              255,
              Math.round(b / 32) * 32
            );

          const hex =
            rgbToHex(
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
          [...buckets.entries()]
            .sort(
              (a, b) =>
                b[1] - a[1]
            )[0]?.[0] ||
          "#d1d5db";

        paletteCache.set(
          imageUrl,
          mainColor
        );

        resolve(mainColor);
      } catch (error) {
        paletteCache.set(
          imageUrl,
          "#d1d5db"
        );

        resolve("#d1d5db");
      }
    };

    image.onerror = () => {
      paletteCache.set(
        imageUrl,
        "#d1d5db"
      );

      resolve("#d1d5db");
    };

    image.src = imageUrl;
  });

const uniqueByColor = (variants = []) => {
  const map = new Map();
  variants.forEach((variant) => {
    const color = cleanColorLabel(variant?.color);
    const colorKey = normalizeColor(color);

    if (colorKey && !map.has(colorKey)) {
      map.set(colorKey, { color, variant });
    }
  });
  return [...map.values()];
};


const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "latest", label: "Mới nhất" },
];


const PRODUCT_ROWS_PER_PAGE = 5;

const getCatalogColumnCount = () => {
  if (typeof window === "undefined") return 4;

  const width = window.innerWidth;
  if (width >= 1800) return 5;
  if (width > 1280) return 4;
  if (width > 980) return 3;
  if (width > 420) return 2;
  return 1;
};

const isCouponActive = (coupon) => {
  if (!coupon) return false;
  if (coupon.status === 0 || coupon.status === false || coupon.status === "0") return false;
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) return false;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return false;
  return true;
};

const formatCompactMoney = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1000 && amount % 1000 === 0) return `${amount / 1000}K`;
  return `${amount.toLocaleString("vi-VN")}Đ`;
};

const getProductPromotion = (product, coupons = []) => {
  const price = Number(product?.price || 0);
  if (!price) return null;

  const eligible = coupons
    .filter((coupon) => coupon?.discount_type !== "shipping")
    .filter(isCouponActive)
    .filter((coupon) => price >= Number(coupon.min_order_value || 0))
    .map((coupon) => {
      const value = Number(coupon.discount_value || 0);
      const actualDiscount = coupon.discount_type === "percent" ? (price * value) / 100 : value;
      return { coupon, actualDiscount };
    })
    .sort((a, b) => b.actualDiscount - a.actualDiscount);

  const best = eligible[0]?.coupon;
  if (!best) return null;

  const value = Number(best.discount_value || 0);
  const discountText = best.discount_type === "percent" ? `${value}%` : formatCompactMoney(value);

  return {
    yellow: `MÃ ${best.code} - GIẢM ${discountText}`,
    red: best.discount_type === "percent" ? `-${value}%` : `-${formatCompactMoney(value)}`,
  };
};


const FEMALE_VISUAL_KEYWORDS = [
  "legging",
  "ôm",
  "croptop",
  "crop top",
  "bra",
  "váy",
  "skirt",
  "dress",
  "hồng",
  "pink",
  "pastel",
  "mini",
  "nhỏ",
  "túi đeo chéo",
  "túi mini",
  "shoulder bag",
  "handbag",
  "sandal",
  "mary jane",
  "ballet",
  "platform",
];

const FEMALE_FALLBACK_IDS = new Set([
  // Quần nữ rõ kiểu dáng
  15,

  // Giày: database chưa ghi chữ "Nữ" trong tên,
  // nên tạm xếp một số mẫu trung tính/thiên nữ sang Nữ.
  27,
  30,
  72,

  // Túi: chọn mẫu có ảnh thật để khu Nữ không bị placeholder.
  34,
]);

const getProductGender = (product) => {
  const name = String(product?.name || "")
    .toLocaleLowerCase("vi-VN")
    .trim();

  const slug = String(product?.slug || "")
    .toLocaleLowerCase("vi-VN")
    .trim();

  const description = String(product?.description || "")
    .toLocaleLowerCase("vi-VN")
    .trim();

  const searchable = `${name} ${slug} ${description}`;

  // Ưu tiên giới tính ghi rõ trong TÊN sản phẩm.
  if (name.includes("nữ")) return "female";
  if (name.includes("nam")) return "male";

  // Nếu tên không ghi Nam/Nữ thì dùng dấu hiệu kiểu dáng.
  if (
    FEMALE_VISUAL_KEYWORDS.some((keyword) =>
      searchable.includes(keyword)
    )
  ) {
    return "female";
  }

  if (FEMALE_FALLBACK_IDS.has(Number(product?.id))) {
    return "female";
  }

  // Các sản phẩm còn lại mặc định Nam như yêu cầu trước đó.
  return "male";
};

const filterProductsByGender = (products = [], gender = "") => {
  if (!gender) return products;

  return products.filter(
    (product) => getProductGender(product) === gender
  );
};

const buildPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const items = [1];
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 4) {
    start = 2;
    end = 5;
  }

  if (currentPage >= totalPages - 3) {
    start = totalPages - 4;
    end = totalPages - 1;
  }

  if (start > 2) items.push("ellipsis-left");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis-right");
  items.push(totalPages);
  return items;
};

function CatalogSportsShowcase({ products = [] }) {
  const femaleProduct = useMemo(() => {
    const femaleProducts = products.filter(
      (product) =>
        getProductGender(product) === "female"
    );

    // Ưu tiên sản phẩm Nữ có ảnh thật.
    // Ví dụ Túi ID 33 có thumbnail = NULL trong DB,
    // nên không dùng nó làm ảnh đại diện nếu còn mẫu Nữ khác có ảnh.
    return (
      femaleProducts.find(
        (product) =>
          Boolean(
            product?.thumbnail ||
            product?.images?.[0]?.image_url ||
            product?.images?.[0]?.image_path
          )
      ) ||
      femaleProducts[0] ||
      null
    );
  }, [products]);

  const maleProduct = useMemo(
    () => {
      // Ưu tiên sản phẩm có chữ "Nam" trong tên.
      // Nếu không có, dùng sản phẩm không ghi Nam/Nữ
      // vì theo quy tắc những sản phẩm đó được xếp Nam.
      const explicitMale = products.find((product) =>
        String(product?.name || "")
          .toLocaleLowerCase("vi-VN")
          .includes("nam")
      );

      return (
        explicitMale ||
        products.find(
          (product) =>
            getProductGender(product) === "male"
        ) ||
        null
      );
    },
    [products]
  );

  const getImage = (product) =>
    product?.thumbnail ||
    product?.images?.[0]?.image_url ||
    product?.images?.[0]?.image_path ||
    "/images/placeholder.png";

  if (!maleProduct && !femaleProduct) return null;

  return (
    <section className="catalog-sports-showcase">
      <div className="catalog-sports-inner">
        <h2>THỂ THAO</h2>

        <div className="catalog-sports-grid">
          {maleProduct && (
            <Link
              to="/products?gender=male"
              className="catalog-sports-tile"
            >
              <img
                src={getImage(maleProduct)}
                alt="Sản phẩm nam"
              />
              <span>SẢN PHẨM NAM</span>
            </Link>
          )}

          {femaleProduct && (
            <Link
              to="/products?gender=female"
              className="catalog-sports-tile"
            >
              <img
                src={getImage(femaleProduct)}
                alt="Sản phẩm nữ"
              />
              <span>SẢN PHẨM NỮ</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CatalogSortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        sortRef.current &&
        !sortRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  const activeLabel =
    SORT_OPTIONS.find(
      (item) => item.value === value
    )?.label || "Mặc định";

  return (
    <div
      ref={sortRef}
      className={`catalog-sort ${
        open ? "open" : ""
      }`}
    >
      <button
        type="button"
        className="catalog-sort-trigger"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>
          Sắp xếp: {activeLabel}
        </span>

        <span
          className="catalog-sort-chevron"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="catalog-sort-menu"
          role="listbox"
        >
          {SORT_OPTIONS.map((item) => (
            <button
              type="button"
              key={item.value}
              role="option"
              aria-selected={
                value === item.value
              }
              className={`catalog-sort-option ${
                value === item.value
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogProductCard({ product, favorite, onWishlist, onQuickAdd, coupons }) {
  const colorVariants = useMemo(
    () =>
      uniqueByColor(
        product?.variants || []
      ),
    [product]
  );

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(
    colorVariants[0]?.color || ""
  );

  const [
    fallbackColor,
    setFallbackColor,
  ] = useState("");

  useEffect(() => {
    setSelectedColor(
      colorVariants[0]?.color || ""
    );
  }, [product?.id]);

  const selectedVariant =
    colorVariants.find(
      (item) =>
        normalizeColor(item.color) === normalizeColor(selectedColor)
    )?.variant || null;

  const variantImage =
    selectedVariant?.image ||
    selectedVariant?.image_url ||
    selectedVariant?.image_path ||
    "";

  const productImage =
    product?.thumbnail ||
    product?.images?.[0]?.image_url ||
    product?.images?.[0]?.image_path ||
    "";

  const displayImage =
    variantImage ||
    productImage ||
    "/images/placeholder.png";

  const showMissingVariantImage =
    !variantImage &&
    !productImage;

  useEffect(() => {
    let isMounted = true;

    /*
      Sản phẩm đã có màu thật từ API/database
      thì KHÔNG tạo màu dự phòng.
    */
    if (colorVariants.length > 0) {
      setFallbackColor("");

      return () => {
        isMounted = false;
      };
    }

    /*
      Sản phẩm chưa có màu trong database:
      chỉ lấy 1 màu chính từ ảnh sản phẩm.
    */
    extractMainColorFromImage(
      displayImage
    ).then((color) => {
      if (isMounted) {
        setFallbackColor(
          color || "#d1d5db"
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    displayImage,
    colorVariants.length,
    product?.id,
  ]);

  const brandName =
    product?.brand?.name ||
    product?.brand_name ||
    "";

  const promotion = getProductPromotion(product, coupons);

  return (
    <article className="catalog-card">
      <Link className="catalog-card-link" to={`/product/${product.id}`}>
        <div className="catalog-card-image-wrap">
          {promotion && (
            <div className="catalog-promo-labels">
              <span className="catalog-promo-yellow">{promotion.yellow}</span>
              <span className="catalog-promo-red">{promotion.red}</span>
            </div>
          )}

          {showMissingVariantImage ? (
            <div className="catalog-missing-image">
              <span>Chưa có hình</span>
            </div>
          ) : (
            <img
              className="catalog-card-image"
              src={displayImage}
              alt={product.name}
            />
          )}

          <button
            type="button"
            className={`catalog-wishlist ${favorite ? "active" : ""}`}
            onClick={(event) => onWishlist(event, product.id)}
            aria-label="Yêu thích"
          >
            <FiHeart size={18} fill={favorite ? "currentColor" : "none"} />
          </button>

          <div className="catalog-card-actions">
            <button type="button" onClick={(event) => onQuickAdd(event, product, selectedColor)}>
              Thêm giỏ
            </button>
            <button type="button" onClick={(event) => onQuickAdd(event, product, selectedColor)}>
              Mua ngay
            </button>
          </div>
        </div>

        <div className="catalog-card-info">
          {brandName && <div className="catalog-brand">{brandName}</div>}
          <h3 className="catalog-name">{product.name}</h3>
          <div className="catalog-price">{Number(product.price || 0).toLocaleString("vi-VN")} đ</div>

          {(colorVariants.length > 0 ||
            fallbackColor) && (
            <div
              className="catalog-colors"
              aria-label="Biến thể màu"
            >
              {colorVariants.length > 0 ? (
                colorVariants.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.color}
                      title={item.color}
                      aria-label={`Màu ${item.color}`}
                      className={`catalog-color-dot ${
                        selectedColor ===
                        item.color
                          ? "active"
                          : ""
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setSelectedColor(
                          item.color
                        );
                      }}
                    >
                      <span
                        style={{
                          background:
                            colorToBackground(
                              item.color
                            ),
                        }}
                      />
                    </button>
                  )
                )
              ) : (
                <button
                  type="button"
                  className="catalog-color-dot catalog-color-dot--static catalog-color-dot--fallback"
                  title="Màu tham khảo từ ảnh sản phẩm"
                  aria-label="Màu tham khảo từ ảnh sản phẩm"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <span
                    style={{
                      background:
                        fallbackColor,
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

export default function ProductPage({ fixedCategory = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openQuickAdd } = useQuickAdd();

  const queryParams = new URLSearchParams(location.search);
  const searchKeyword = queryParams.get("search") || "";
  const genderFilter = queryParams.get("gender") || "";
  const categoryIdFilter = queryParams.get("category_id") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(fixedCategory);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(
    () => PRODUCT_ROWS_PER_PAGE * getCatalogColumnCount()
  );

  useEffect(() => {
    const updateProductsPerPage = () => {
      setProductsPerPage(
        PRODUCT_ROWS_PER_PAGE * getCatalogColumnCount()
      );
    };

    updateProductsPerPage();
    window.addEventListener("resize", updateProductsPerPage);

    return () => {
      window.removeEventListener("resize", updateProductsPerPage);
    };
  }, []);

  useEffect(() => {
    if (searchKeyword || genderFilter || categoryIdFilter) {
      setSelectedCategory("");
      setSelectedBrands([]);
      setPriceFilter("all");
    } else {
      setSelectedCategory(fixedCategory);
    }
  }, [searchKeyword, genderFilter, categoryIdFilter, fixedCategory]);

  const categoryOptions = useMemo(() => {
    const categories = new Map();

    showcaseProducts.forEach((product) => {
      const categoryName = String(product?.category?.name || "").trim();
      if (categoryName) categories.set(categoryName, categoryName);
    });

    return [...categories.values()].sort((a, b) =>
      a.localeCompare(b, "vi")
    );
  }, [showcaseProducts]);

  const brandOptions = useMemo(() => {
    const brands = new Map();

    showcaseProducts.forEach((product) => {
      const brandId = product?.brand?.id;
      const brandName = String(product?.brand?.name || "").trim();

      if (brandId !== null && brandId !== undefined && brandName) {
        brands.set(String(brandId), brandName);
      }
    });

    return [...brands.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [showcaseProducts]);

  useEffect(() => {
    const loadCatalogExtras = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token.trim()}`;

        const response = await fetch(`${API_BASE_URL}/coupons`, { headers });
        const result = await response.json();
        const couponData = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        const validCoupons = couponData.filter(isCouponActive);
        if (response.ok) setCoupons(validCoupons);
      } catch (error) {
        setCoupons([]);
      }

      try {
        const allProducts = await productService.getProducts({ sort: "default" });
        if (Array.isArray(allProducts)) setShowcaseProducts(allProducts);
      } catch (error) {
        setShowcaseProducts([]);
      }
    };

    loadCatalogExtras();
  }, []);

  const handleBrandToggle = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const filters = { sort: sortOption };
        if (categoryIdFilter) filters.category_id = categoryIdFilter;
        else if (fixedCategory) filters.category = fixedCategory;
        else if (selectedCategory) filters.category = selectedCategory;
        if (searchKeyword) filters.search = searchKeyword;

        if (selectedBrands.length) filters.brand_ids = selectedBrands.join(",");
        if (priceFilter === "under_1m") filters.max_price = 1000000;
        if (priceFilter === "1m_2m") { filters.min_price = 1000000; filters.max_price = 2000000; }
        if (priceFilter === "over_2m") filters.min_price = 2000000;

        const data = await productService.getProducts(filters);
        const productList = Array.isArray(data) ? data : [];

        setProducts(
          filterProductsByGender(
            productList,
            genderFilter
          )
        );

        const token = localStorage.getItem("access_token");
        if (token) {
          const response = await fetch(`${API_BASE_URL}/user/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const wishlist = await response.json();
          if (response.ok && wishlist.status) {
            setFavoriteIds((wishlist.data || []).map((item) => item.product_id));
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [
    selectedCategory,
    selectedBrands,
    priceFilter,
    sortOption,
    searchKeyword,
    genderFilter,
    categoryIdFilter,
    fixedCategory,
  ]);

  const handleToggleWishlist = async (event, productId) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await response.json();
      if (response.ok && data.status) {
        setFavoriteIds((prev) =>
          data.is_favorite ? [...new Set([...prev, productId])] : prev.filter((id) => id !== productId)
        );
        toast.success(data.message || "Đã cập nhật yêu thích");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  const handleOpenQuickAdd = (event, product, preferredColor = "") => {
    event.preventDefault();
    event.stopPropagation();
    openQuickAdd(product, preferredColor);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [products, productsPerPage]);

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return products.slice(start, start + productsPerPage);
  }, [products, currentPage, productsPerPage]);

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(nextPage);

    window.requestAnimationFrame(() => {
      document
        .querySelector(".product-content")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <Toaster position="top-right" />
      <section className="catalog-heading">
        <span>Trang chủ / Sản phẩm</span>
        <h1>
          {searchKeyword
            ? `Kết quả tìm kiếm: “${searchKeyword}”`
            : fixedCategory
              ? `Sản Phẩm ${fixedCategory}`
              : "Tất Cả Sản Phẩm"}
        </h1>
      </section>

      <CatalogSportsShowcase products={showcaseProducts} />

      <main className="product-page ash-category-layout">
        <aside className="sidebar ash-sidebar">
          <div className="filter-title">BỘ LỌC</div>
          
            <div className="filter-box">
              <h3>Danh mục sản phẩm</h3>
              {fixedCategory ? (
                <label className="catalog-fixed-category">
                  <input type="radio" checked readOnly />
                  <span>{fixedCategory}</span>
                </label>
              ) : (
                ["", ...categoryOptions].map((value) => (
                  <label key={value || "all-category"}>
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === value}
                      onChange={() => setSelectedCategory(value)}
                    />
                    <span>{value || "Tất cả"}</span>
                  </label>
                ))
              )}
            </div>

          <div className="filter-box">
            <h3>THƯƠNG HIỆU</h3>
            {brandOptions.map((brand) => (
              <label key={brand.id}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandToggle(brand.id)}
                />
                <span>{brand.name}</span>
              </label>
            ))}
          </div>

          <div className="filter-box">
            <h3>KHOẢNG GIÁ</h3>
            {[
              ["all", "Tất cả"],
              ["under_1m", "Dưới 1.000.000đ"],
              ["1m_2m", "1.000.000đ - 2.000.000đ"],
              ["over_2m", "Trên 2.000.000đ"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="price"
                  checked={priceFilter === value}
                  onChange={() => setPriceFilter(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className="product-content">
          <div className="top-bar ash-top-bar">
            <span className="product-count">{products.length} sản phẩm</span>
            <CatalogSortDropdown
              value={sortOption}
              onChange={setSortOption}
            />
          </div>

          {loading ? (
            <div className="loading-state">Đang tải sản phẩm...</div>
          ) : products.length ? (
            <div className="shop-product-grid ash-five-grid">
              {paginatedProducts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  favorite={favoriteIds.includes(product.id)}
                  onWishlist={handleToggleWishlist}
                  onQuickAdd={handleOpenQuickAdd}
                  coupons={coupons}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>
          )}

          {!loading && products.length > 0 && totalPages > 1 && (
            <nav className="catalog-pagination" aria-label="Phân trang sản phẩm">
              <button
                type="button"
                className="catalog-page-arrow"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                aria-label="Trang trước"
              >
                ‹
              </button>

              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    type="button"
                    key={item}
                    className={`catalog-page-number ${currentPage === item ? "active" : ""}`}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="catalog-page-ellipsis">…</span>
                )
              )}

              <button
                type="button"
                className="catalog-page-arrow"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                aria-label="Trang sau"
              >
                ›
              </button>
            </nav>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
