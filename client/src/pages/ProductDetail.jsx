import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import Footer from "../components/Footer";
import "./ProductDetail.css";

const products = [
  {
    id: 1,
    name: "Quần Jeans Ôm Vừa",
    price: "299.000đ",
    image: "/src/public/images/quanjeans.png",
    rating: "4.8",
    description: "Quần jeans ôm vừa, chất liệu co giãn, mặc thoải mái."
  },
  {
    id: 2,
    name: "Quần Short Thể Thao",
    price: "599.000đ",
    image: "/src/public/images/quanshortthethao.png",
    rating: "4.9",
    description: "Quần short thể thao năng động."
  },
  {
    id: 3,
    name: "Quần Jeans Slim Fit",
    price: "499.000đ",
    image: "/src/public/images/quanjeansslimfit.png",
    rating: "5.0",
    description: "Thiết kế trẻ trung, ôm dáng."
  },
  {
    id: 4,
    name: "Áo Phông Cotton Cơ Bản",
    price: "359.000đ",
    image: "/src/public/images/aophongcotton.png",
    rating: "5.1",
    description: "Áo cotton mềm mại."
  },
  {
    id: 5,
    name: "Áo Khoác Denim Nam",
    price: "899.000đ",
    image: "/src/public/images/aokhoacdenimnam.png",
    rating: "5.2",
    description: "Áo khoác denim phong cách."
  },
  {
    id: 6,
    name: "Áo Khoác Bomber Nữ",
    price: "429.000đ",
    image: "/src/public/images/aokhoacbombernu.png",
    rating: "5.3",
    description: "Bomber nữ cá tính."
  },
  {
    id: 7,
    name: "Quần Shorts Trẻ Em",
    price: "349.000đ",
    image: "/src/public/images/quanshortstreem.png",
    rating: "5.4",
    description: "Short trẻ em."
  },
  {
    id: 8,
    name: "Áo Gile Len Nam",
    price: "699.000đ",
    image: "/src/public/images/aogilelennam.png",
    rating: "5.5",
    description: "Áo gile len."
  },
  {
    id: 9,
    name: "Áo Hoodie Unisex",
    price: "699.000đ",
    image: "/src/public/images/aohoodieunisex.png",
    rating: "5.6",
    description: "Hoodie unisex."
  },
  {
    id: 10,
    name: "Áo Sơ Mi",
    price: "250.000đ",
    image: "/src/public/images/aosomi.png",
    rating: "4.5",
    description: "Áo sơ mi lịch lãm, phù hợp đi làm và đi chơi."
  }
];

// Danh sách đánh giá mẫu ban đầu
const initialReviews = [
  {
    id: 1,
    name: "Minh Anh",
    rating: 5,
    comment: "Chất lượng rất tốt, đúng như mô tả. Sẽ mua lại lần sau.",
    date: "20/07/2026"
  },
  {
    id: 2,
    name: "Quốc Huy",
    rating: 4,
    comment: "Sản phẩm ổn, giao hàng hơi chậm một chút.",
    date: "18/07/2026"
  },
  {
    id: 3,
    name: "Thu Trang",
    rating: 5,
    comment: "Form đẹp, chất vải mát, mặc rất thoải mái.",
    date: "15/07/2026"
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // 2. Khởi tạo hook chuyển trang

  const product = products.find((item) => item.id === Number(id));

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");

  // Tab mô tả / đánh giá
  const [activeTab, setActiveTab] = useState("description");

  // State đánh giá
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: ""
  });

  // Tự động cuộn lên đầu trang và reset lại state khi thay đổi sản phẩm
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setActiveTab("description");
  }, [id]);

  if (!product) {
    return <h2>Không tìm thấy sản phẩm</h2>;
  }

  // Sản phẩm liên quan
  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  // Tính điểm trung bình đánh giá
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  // Xử lý Thêm vào giỏ hàng và chuyển trang
  const handleAddToCart = () => {
    // Nếu dự án của bạn lưu giỏ hàng vào localStorage/Context, xử lý tại đây:
    // const cartItem = { ...product, quantity, size, color };
    
    // Chuyển hướng sang trang giỏ hàng
    navigate("/cart");
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!newReview.name.trim() || !newReview.comment.trim()) {
      alert("Vui lòng nhập đầy đủ tên và nội dung đánh giá.");
      return;
    }

    const review = {
      id: Date.now(),
      name: newReview.name,
      rating: Number(newReview.rating),
      comment: newReview.comment,
      date: new Date().toLocaleDateString("vi-VN")
    };

    setReviews([review, ...reviews]);
    setNewReview({ name: "", rating: 5, comment: "" });
  };

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="separator">&gt;</span>
        <Link to="/products">Sản phẩm</Link>
        <span className="separator">&gt;</span>
        <span className="current-page">{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-image">
          <img
            src={product.image}
            alt={product.name}
            className="product-main-image"
          />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>

          <div className="rating">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <span>
              {averageRating} ({reviews.length} đánh giá)
            </span>
          </div>

          <h2>{product.price}</h2>

          <hr />

          <div className="option">
            <h4>Kích thước</h4>
            <div className="size-list">
              {["S", "M", "L", "XL"].map((item) => (
                <button
                  key={item}
                  className={size === item ? "active" : ""}
                  onClick={() => setSize(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="option">
            <h4>Màu sắc</h4>
            <div className="color-list">
              <button
                className={color === "Black" ? "active" : ""}
                onClick={() => setColor("Black")}
              >
                Black
              </button>
            </div>
          </div>

          <div className="option">
            <h4>Số lượng</h4>
            <div className="quantity-box">
              <button
                className="qty-btn"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                -
              </button>
              <input type="text" value={quantity} readOnly />
              <button
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="cart-action">
            {/* 3. Gắn hàm handleAddToCart vào sự kiện onClick */}
            <button className="add-cart" onClick={handleAddToCart}>
              <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
            </button>
            <button className="share-btn">
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>

          <div className="product-meta">
            <p>
              <b>Thương hiệu:</b> Nike
            </p>
            <p>
              <b>Danh mục:</b> Shorts
            </p>
            <p>
              <b>Chất liệu:</b> 90% Polyester, 10% Elastane
            </p>
            <p>
              <b>Kiểu dáng:</b> Sportswear
            </p>
            <p>
              <b>Phù hợp:</b> Nam
            </p>
            <p>
              <b>Kiểu dáng:</b> Regular
            </p>
            <p>
              <b>Hướng dẫn giặt:</b> Giặt máy với nước lạnh, không tẩy, phơi
              tự nhiên.
            </p>
            <p>
              <b>Mùa:</b> Summer
            </p>
            <p>
              <b>Tình trạng:</b> Còn hàng
            </p>
          </div>
        </div>
      </div>

      {/* Mô tả sản phẩm / Đánh giá */}
      <div className="description-box">
        <div className="tab">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Đánh giá ({reviews.length})
          </button>
        </div>

        {activeTab === "description" && (
          <div className="tab-content">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="tab-content reviews-section">
            {/* Form gửi đánh giá */}
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h4>Viết đánh giá của bạn</h4>

              <input
                type="text"
                placeholder="Tên của bạn"
                value={newReview.name}
                onChange={(e) =>
                  setNewReview({ ...newReview, name: e.target.value })
                }
              />

              <div className="rating-select">
                <label>Số sao: </label>
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({ ...newReview, rating: e.target.value })
                  }
                >
                  <option value={5}>5 sao</option>
                  <option value={4}>4 sao</option>
                  <option value={3}>3 sao</option>
                  <option value={2}>2 sao</option>
                  <option value={1}>1 sao</option>
                </select>
              </div>

              <textarea
                placeholder="Nội dung đánh giá..."
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
              ></textarea>

              <button type="submit" className="submit-review-btn">
                Gửi đánh giá
              </button>
            </form>

            {/* Danh sách đánh giá */}
            <div className="review-list">
              {reviews.map((r) => (
                <div className="review-item" key={r.id}>
                  <div className="review-header">
                    <span className="review-name">{r.name}</span>
                    <span className="review-date">{r.date}</span>
                  </div>

                  <div className="review-stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <i
                        key={index}
                        className={
                          index < r.rating
                            ? "fa-solid fa-star"
                            : "fa-regular fa-star"
                        }
                      ></i>
                    ))}
                  </div>

                  <p className="review-comment">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sản phẩm liên quan */}
      <div className="related-products">
        <h3>Sản phẩm liên quan</h3>
        <div className="related-list">
          {relatedProducts.map((item) => (
            <Link
              to={`/product/${item.id}`}
              className="related-card"
              key={item.id}
            >
              <img src={item.image} alt={item.name} />
              <h4>{item.name}</h4>
              <p>{item.price}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}