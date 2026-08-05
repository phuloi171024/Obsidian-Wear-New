import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "./ProductDetail.css";
import { productService } from "../services/productService";
import toast, { Toaster } from "react-hot-toast";

const initialReviews = [
  { id: 1, name: "Minh Anh", rating: 5, comment: "Chất lượng rất tốt, đúng như mô tả.", date: "20/07/2026" },
  { id: 2, name: "Quốc Huy", rating: 4, comment: "Sản phẩm ổn, giao hàng nhanh.", date: "18/07/2026" }
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);

        if (data && data.variants) {
          const sizes = [...new Set(data.variants.map((v) => v.size))];
          const colors = [...new Set(data.variants.map((v) => v.color))];
          
          setAvailableSizes(sizes);
          setAvailableColors(colors);
          
          if (sizes.length > 0) setSize(sizes[0]);
          if (colors.length > 0) setColor(colors[0]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
    setQuantity(1);
    setActiveTab("description");
  }, [id]);

  if (loading) return <h2 style={{ textAlign: "center", padding: "100px" }}>Đang tải thông tin sản phẩm...</h2>;
  if (!product) return <h2 style={{ textAlign: "center", padding: "100px" }}>Không tìm thấy sản phẩm!</h2>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  // Xử lý thêm vào giỏ hàng và gọi API chuẩn
  const handleAddToCart = async () => {
    if (!size || !color) {
      toast.error("Vui lòng chọn Kích thước và Màu sắc!");
      return;
    }

    const selectedVariant = product.variants?.find(
      (v) => v.size === size && v.color === color
    );

    if (!selectedVariant) {
      toast.error("Sản phẩm với phân loại này hiện không có sẵn!");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          product_variant_id: selectedVariant.id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        navigate("/cart");
      } else {
        toast.error(data.message || "Thêm vào giỏ hàng thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    }
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
      <Toaster position="top-right" />
      <Header />
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
            src={product.thumbnail || (product.images && product.images[0]?.image_path) || "https://placehold.co/500"}
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
            <span>{averageRating} ({reviews.length} đánh giá)</span>
          </div>

          <h2>{new Intl.NumberFormat('vi-VN').format(product.price)} đ</h2>

          <hr />

          <div className="option">
            <h4>Kích thước</h4>
            <div className="size-list">
              {availableSizes.length > 0 ? availableSizes.map((item) => (
                <button
                  key={item}
                  className={size === item ? "active" : ""}
                  onClick={() => setSize(item)}
                >
                  {item}
                </button>
              )) : <span>Freesize</span>}
            </div>
          </div>

          <div className="option">
            <h4>Màu sắc</h4>
            <div className="color-list">
              {availableColors.length > 0 ? availableColors.map((item) => (
                <button
                  key={item}
                  className={color === item ? "active" : ""}
                  onClick={() => setColor(item)}
                >
                  {item}
                </button>
              )) : <span>Mặc định</span>}
            </div>
          </div>

          <div className="option">
            <h4>Số lượng</h4>
            <div className="quantity-box">
              <button className="qty-btn" onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
              <input type="text" value={quantity} readOnly />
              <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="cart-action">
            <button className="add-cart" onClick={handleAddToCart}>
              <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
            </button>
            <button className="share-btn">
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>

          <div className="product-meta">
            <p><b>Thương hiệu:</b> {product.brand ? product.brand.name : "Chưa cập nhật"}</p>
            <p><b>Danh mục:</b> {product.category ? product.category.name : "Chưa cập nhật"}</p>
            <p><b>SKU:</b> {product.sku}</p>
            <p><b>Tình trạng:</b> {product.status ? "Còn hàng" : "Ngừng kinh doanh"}</p>
          </div>
        </div>
      </div>

      <div className="description-box">
        <div className="tab">
          <button className={activeTab === "description" ? "active" : ""} onClick={() => setActiveTab("description")}>
            Mô tả sản phẩm
          </button>
          <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>
            Đánh giá ({reviews.length})
          </button>
        </div>

        {activeTab === "description" && (
          <div className="tab-content">
            <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="tab-content reviews-section">
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h4>Viết đánh giá của bạn</h4>
              <input type="text" placeholder="Tên của bạn" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
              <div className="rating-select">
                <label>Số sao: </label>
                <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}>
                  <option value={5}>5 sao</option>
                  <option value={4}>4 sao</option>
                  <option value={3}>3 sao</option>
                  <option value={2}>2 sao</option>
                  <option value={1}>1 sao</option>
                </select>
              </div>
              <textarea placeholder="Nội dung đánh giá..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}></textarea>
              <button type="submit" className="submit-review-btn">Gửi đánh giá</button>
            </form>

            <div className="review-list">
              {reviews.map((r) => (
                <div className="review-item" key={r.id}>
                  <div className="review-header">
                    <span className="review-name">{r.name}</span>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <div className="review-stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <i key={index} className={index < r.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                    ))}
                  </div>
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}