import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "./ProductDetail.css";
import { productService } from "../services/productService";
import toast, { Toaster } from "react-hot-toast";

const initialReviews = [
  {
    id: 1,
    name: "Minh Anh",
    rating: 5,
    comment: "Chất lượng rất tốt, đúng như mô tả.",
    date: "20/07/2026",
  },
  {
    id: 2,
    name: "Quốc Huy",
    rating: 4,
    comment: "Sản phẩm ổn, giao hàng nhanh.",
    date: "18/07/2026",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fetch chi tiết sản phẩm và sản phẩm liên quan từ Database qua API
  useEffect(() => {
    const fetchProductDetailAndRelated = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        setQuantity(1);
        setActiveTab("description");

        // 1. Lấy chi tiết sản phẩm hiện tại
        const data = await productService.getProductById(id);
        // Kiểm tra sản phẩm hiện tại có nằm trong danh sách yêu thích không
const token = localStorage.getItem("access_token");

if (token) {
  try {
    const wishlistRes = await fetch(
      "http://localhost:8000/api/user/wishlist",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const wishlistData = await wishlistRes.json();

    if (
      wishlistRes.ok &&
      wishlistData.status &&
      Array.isArray(wishlistData.data)
    ) {
      const exists = wishlistData.data.some(
        (item) => item.product_id === data.id
      );

      setIsFavorite(exists);
    }
  } catch (error) {
    console.error(
      "Không thể kiểm tra danh sách yêu thích:",
      error
    );
  }
}
        setProduct(data);

        // Xử lý trích xuất Size và Màu từ variants của database
        if (data.variants && data.variants.length > 0) {
          const sizes = [
            ...new Set(
              data.variants
                .map((v) => v.size)
                .filter(Boolean)
            ),
          ];

          const colors = [
            ...new Set(
              data.variants
                .map((v) => v.color)
                .filter(Boolean)
            ),
          ];

          setAvailableSizes(sizes);
          setAvailableColors(colors);

          if (sizes.length > 0) {
            setSize(sizes[0]);
          }

          if (colors.length > 0) {
            setColor(colors[0]);
          }
        }

        // 2. Lấy sản phẩm liên quan dựa vào thương hiệu (brand_id)
        // hoặc danh mục (category_id) của sản phẩm hiện tại
        const allProducts = await productService.getProducts();

        if (Array.isArray(allProducts)) {
          const filtered = allProducts
            .filter(
              (item) =>
                item.id !== data.id &&
                (item.brand_id === data.brand_id ||
                  item.category_id === data.category_id)
            )
            .slice(0, 4);

          // Nếu không đủ sản phẩm cùng thương hiệu/danh mục,
          // lấy bù các sản phẩm khác
          if (filtered.length < 4) {
            const extra = allProducts
              .filter(
                (item) =>
                  item.id !== data.id &&
                  !filtered.some(
                    (f) => f.id === item.id
                  )
              )
              .slice(0, 4 - filtered.length);

            setRelatedProducts([
              ...filtered,
              ...extra,
            ]);
          } else {
            setRelatedProducts(filtered);
          }
        }
      } catch (error) {
        console.error(
          "Lỗi khi tải chi tiết sản phẩm:",
          error
        );

        toast.error(
          "Không thể tải thông tin sản phẩm từ máy chủ!"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetailAndRelated();
    }
  }, [id]);
const handleToggleWishlist = async () => {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    toast.error(
      "Vui lòng đăng nhập để thêm vào yêu thích!"
    );

    navigate("/login");
    return;
  }

  try {
    setFavoriteLoading(true);

    const res = await fetch(
      "http://localhost:8000/api/user/wishlist/toggle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.status) {
      setIsFavorite(data.is_favorite);

      toast.success(
        data.message ||
          (data.is_favorite
            ? "Đã thêm vào danh sách yêu thích!"
            : "Đã bỏ khỏi danh sách yêu thích!")
      );

      return;
    }

    if (res.status === 401) {
      localStorage.removeItem(
        "access_token"
      );

      toast.error(
        "Phiên đăng nhập đã hết hạn!"
      );

      navigate("/login");
      return;
    }

    toast.error(
      data.message ||
        "Không thể cập nhật danh sách yêu thích"
    );
  } catch (error) {
    console.error(
      "Lỗi Wishlist:",
      error
    );

    toast.error(
      "Không thể kết nối đến máy chủ"
    );
  } finally {
    setFavoriteLoading(false);
  }
};
  // Xử lý thêm vào giỏ hàng
  // CHỈ SỬA PHẦN API, KHÔNG ĐỔI GIAO DIỆN
  const handleAddToCart = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      toast.error(
        "Vui lòng đăng nhập để thêm vào giỏ hàng!"
      );
      navigate("/login");
      return false;
    }

    if (
      availableSizes.length > 0 &&
      !size
    ) {
      toast.error(
        "Vui lòng chọn kích thước!"
      );
      return false;
    }

    if (
      availableColors.length > 0 &&
      !color
    ) {
      toast.error(
        "Vui lòng chọn màu sắc!"
      );
      return false;
    }

    try {
      setSubmitting(true);

      // Tìm đúng variant theo Size + Color
      let matchedVariant = null;

      if (
        product.variants &&
        product.variants.length > 0
      ) {
        matchedVariant =
          product.variants.find(
            (v) =>
              v.size === size &&
              v.color === color
          );
      }

      // Không tự fallback sang variant khác
      if (!matchedVariant) {
        toast.error(
          "Phiên bản sản phẩm này hiện không có sẵn trong hệ thống!"
        );
        return false;
      }

      // Backend sẽ kiểm tra stock lần cuối.
      // Frontend chỉ kiểm tra trước để báo UX tốt hơn.
      const stock = Number(
        matchedVariant.stock || 0
      );

      if (stock <= 0) {
        toast.error(
          "Sản phẩm đã hết hàng."
        );
        return false;
      }

      if (quantity > stock) {
        toast.error(
          `Chỉ còn ${stock} sản phẩm trong kho.`
        );
        return false;
      }

      // Gọi API mới
      const res = await fetch(
        "http://localhost:8000/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({
            product_variant_id:
              matchedVariant.id,
            quantity: quantity,
          }),
        }
      );

      const data = await res.json();

      // Thành công
      if (res.ok && data.success) {
        toast.success(
          data.message ||
            "Đã thêm sản phẩm vào giỏ hàng!"
        );

        return true;
      }

      // Token hết hạn
      if (res.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        toast.error(
          "Phiên đăng nhập đã hết hạn!"
        );

        navigate("/login");

        return false;
      }

      // Backend lỗi 422 / 404 / ...
      // Hiện đúng message từ Laravel
      toast.error(
        data.message ||
          "Không thể thêm vào giỏ hàng"
      );

      return false;
    } catch (error) {
      console.error(
        "Lỗi kết nối:",
        error
      );

      toast.error(
        "Lỗi kết nối đến máy chủ"
      );

      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // MUA NGAY - Thêm vào giỏ và chuyển thẳng
  // sang trang điền thông tin thanh toán
  const handleBuyNow = async () => {
    const success =
      await handleAddToCart();

    if (success) {
      setTimeout(() => {
        navigate("/shipping-info");
      }, 400);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (
      !newReview.name ||
      !newReview.comment
    ) {
      toast.error(
        "Vui lòng điền đầy đủ họ tên và nội dung đánh giá!"
      );
      return;
    }

    const reviewObj = {
      id: Date.now(),
      name: newReview.name,
      rating: Number(
        newReview.rating
      ),
      comment: newReview.comment,
      date: new Date().toLocaleDateString(
        "vi-VN"
      ),
    };

    setReviews([
      reviewObj,
      ...reviews,
    ]);

    setNewReview({
      name: "",
      rating: 5,
      comment: "",
    });

    toast.success(
      "Cảm ơn bạn đã gửi đánh giá!"
    );
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          fontSize: "18px",
        }}
      >
        Đang tải sản phẩm...
      </div>
    );

  if (!product)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px",
          fontSize: "18px",
        }}
      >
        Sản phẩm không tồn tại!
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />

      <div className="breadcrumb">
        <Link to="/">
          Trang chủ
        </Link>

        <span className="separator">
          &gt;
        </span>

        <Link to="/products">
          Sản phẩm
        </Link>

        <span className="separator">
          &gt;
        </span>

        <span className="current-page">
          {product.name}
        </span>
      </div>

      <div className="product-detail">
        <div className="product-image">
          <img
            src={
              product.images &&
              product.images.length > 0
                ? product.images[0].image_url
                : "/images/placeholder.png"
            }
            alt={product.name}
            className="product-main-image"
          />
        </div>

        <div className="product-info">
          <h1 className="product-title">
            {product.name}
          </h1>

          <p className="product-sku">
            Mã sản phẩm:{" "}
            {product.sku ||
              "Chưa cập nhật"}
          </p>

          <div className="product-price">
            {Number(
              product.price
            ).toLocaleString(
              "vi-VN"
            )}{" "}
            đ
          </div>

          <hr />

          {/* Chọn Size động từ Database */}
          {availableSizes.length > 0 && (
            <div className="option product-options">
              <h4>
                Kích thước (Size)
              </h4>

              <div className="size-list size-options">
                {availableSizes.map(
                  (s) => (
                    <button
                      key={s}
                      className={`size-btn ${
                        size === s
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSize(s)
                      }
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Chọn Màu động từ Database */}
          {availableColors.length > 0 && (
            <div className="option product-options">
              <h4>Màu sắc</h4>

              <div className="color-list color-options">
                {availableColors.map(
                  (c) => (
                    <button
                      key={c}
                      className={`color-btn ${
                        color === c
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setColor(c)
                      }
                    >
                      {c}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Số lượng */}
          <div className="option quantity-section">
            <h4>Số lượng</h4>

            <div className="quantity-box">
              <button
                className="qty-btn"
                onClick={() =>
                  setQuantity(
                    (prev) =>
                      Math.max(
                        1,
                        prev - 1
                      )
                  )
                }
              >
                -
              </button>

              <input
                type="text"
                value={quantity}
                readOnly
              />

              <button
                className="qty-btn"
                onClick={() =>
                  setQuantity(
                    (prev) =>
                      prev + 1
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div
            className="cart-action action-buttons"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            
            <button
              className="add-cart add-to-cart"
              onClick={
                handleAddToCart
              }
              disabled={
                submitting
              }
            >
              <i className="fa-solid fa-cart-shopping"></i>{" "}
              {submitting
                ? "Đang xử lý..."
                : "Thêm vào giỏ hàng"}
            </button>

            <button
              className="buy-now-btn"
              onClick={
                handleBuyNow
              }
              disabled={
                submitting
              }
              style={{
                background:
                  "#1d4ed8",
                color: "#fff",
                border: "none",
                padding:
                  "12px 24px",
                borderRadius: "6px",
                fontWeight:
                  "600",
                cursor:
                  "pointer",
                transition:
                  "background 0.2s",
                flex: 1,
              }}
              onMouseOver={(e) =>
                (e.target.style.background =
                  "#1e40af")
              }
              onMouseOut={(e) =>
                (e.target.style.background =
                  "#1d4ed8")
              }
            >
               Mua ngay
            </button>

           <button
  className="share-btn wishlist-detail-btn"
  onClick={handleToggleWishlist}
  disabled={favoriteLoading}
  title={
    isFavorite
      ? "Bỏ khỏi yêu thích"
      : "Thêm vào yêu thích"
  }
  style={{
    color: isFavorite
      ? "#e11d48"
      : "#64748b",
    transition: "all 0.2s",
    opacity: favoriteLoading
      ? 0.6
      : 1,
  }}
>
  <i
    className={
      isFavorite
        ? "fa-solid fa-heart"
        : "fa-regular fa-heart"
    }
  ></i>
</button>

<button className="share-btn">
  <i className="fa-solid fa-share-nodes"></i>
</button>
          </div>

          <div className="product-meta">
            <p>
              <b>
                Thương hiệu:
              </b>{" "}
              {product.brand
                ? product.brand.name
                : "Chính hãng"}
            </p>

            <p>
              <b>
                Danh mục:
              </b>{" "}
              {product.category
                ? product.category.name
                : "Thể thao"}
            </p>

            <p>
              <b>
                Tình trạng:
              </b>{" "}
              Còn hàng
            </p>
          </div>
        </div>
      </div>

      {/* Mô tả sản phẩm / Đánh giá */}
      <div className="description-box product-tabs">
        <div className="tab tab-header">
          <button
            className={
              activeTab ===
              "description"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "description"
              )
            }
          >
            Mô tả sản phẩm
          </button>

          <button
            className={
              activeTab ===
              "reviews"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "reviews"
              )
            }
          >
            Đánh giá (
            {reviews.length})
          </button>
        </div>

        {activeTab ===
          "description" && (
          <div className="tab-content description-content">
            <p>
              {product.description ||
                "Chưa có mô tả chi tiết cho sản phẩm này."}
            </p>
          </div>
        )}

        {activeTab ===
          "reviews" && (
          <div className="tab-content reviews-content reviews-section">
            <form
              className="review-form"
              onSubmit={
                handleReviewSubmit
              }
            >
              <h4>
                Viết đánh giá của bạn
              </h4>

              <input
                type="text"
                placeholder="Tên của bạn"
                value={
                  newReview.name
                }
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    name:
                      e.target.value,
                  })
                }
              />

              <div className="rating-select">
                <label>
                  Số sao:{" "}
                </label>

                <select
                  value={
                    newReview.rating
                  }
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      rating:
                        e.target.value,
                    })
                  }
                >
                  <option value={5}>
                    5 sao
                  </option>
                  <option value={4}>
                    4 sao
                  </option>
                  <option value={3}>
                    3 sao
                  </option>
                  <option value={2}>
                    2 sao
                  </option>
                  <option value={1}>
                    1 sao
                  </option>
                </select>
              </div>

              <textarea
                placeholder="Nội dung đánh giá..."
                value={
                  newReview.comment
                }
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    comment:
                      e.target.value,
                  })
                }
              ></textarea>

              <button
                type="submit"
                className="submit-review-btn"
              >
                Gửi đánh giá
              </button>
            </form>

            <div className="review-list">
              {reviews.map(
                (r) => (
                  <div
                    className="review-item"
                    key={r.id}
                  >
                    <div className="review-header">
                      <span className="review-name">
                        {r.name}
                      </span>

                      <span className="review-date">
                        {r.date}
                      </span>
                    </div>

                    <div className="review-stars review-rating">
                      {Array.from({
                        length: 5,
                      }).map(
                        (
                          _,
                          index
                        ) => (
                          <i
                            key={
                              index
                            }
                            className={
                              index <
                              r.rating
                                ? "fa-solid fa-star"
                                : "fa-regular fa-star"
                            }
                          ></i>
                        )
                      )}
                    </div>

                    <p className="review-comment">
                      {r.comment}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sản phẩm liên quan */}
      <div className="related-products">
        <h3>
          Sản phẩm liên quan
        </h3>

        <div className="related-list">
          {relatedProducts.length >
          0 ? (
            relatedProducts.map(
              (item) => (
                <Link
                  to={`/product/${item.id}`}
                  className="related-card"
                  key={item.id}
                >
                  <img
                    src={
                      item.images &&
                      item.images
                        .length > 0
                        ? item.images[0]
                            .image_url
                        : "/images/placeholder.png"
                    }
                    alt={item.name}
                  />

                  <p>
                    {Number(
                      item.price
                    ).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    đ
                  </p>
                </Link>
              )
            )
          ) : (
            <p
              style={{
                textAlign:
                  "center",
                color: "#666",
                width: "100%",
              }}
            >
              Không có sản phẩm liên quan nào.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}