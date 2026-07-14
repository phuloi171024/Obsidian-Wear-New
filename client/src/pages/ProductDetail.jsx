import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
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

export default function ProductDetail() {
  const { id } = useParams();

  const product = products.find((item) => item.id === Number(id));

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");

  if (!product) {
    return <h2>Không tìm thấy sản phẩm</h2>;
  }

  return (
    <>
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

            <span>4.6 (15 đánh giá)</span>

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

          </div>          <div className="option">

            <h4>Số lượng</h4>

            <div className="quantity-box">

              <button
            className="qty-btn"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
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
            onClick={() => setQuantity(quantity + 1)}
        >
            +
        </button>

            </div>

          </div>

          <div className="cart-action">

            <button className="add-cart">

              <i className="fa-solid fa-cart-shopping"></i>

              Thêm vào giỏ hàng

            </button>

            <button className="share-btn">

              <i className="fa-solid fa-share-nodes"></i>

            </button>

          </div>

          <div className="product-meta">

            <p><b>Thương hiệu:</b> Nike</p>

            <p><b>Danh mục:</b> Shorts</p>

            <p><b>Chất liệu:</b> 90% Polyester, 10% Elastane</p>

            <p><b>Kiểu dáng:</b> Sportswear</p>

            <p><b>Phù hợp:</b> Nam</p>

            <p><b>Kiểu dáng:</b> Regular</p>

            <p>
              <b>Hướng dẫn giặt:</b> Giặt máy với nước lạnh,
              không tẩy, phơi tự nhiên.
            </p>

            <p><b>Mùa:</b> Summer</p>

            <p><b>Tình trạng:</b> Còn hàng</p>

          </div>

        </div>

      </div>

      <div className="description-box">

        <div className="tab">

          <button className="active">

            Mô tả sản phẩm

          </button>

          <button>

            Đánh giá (15)

          </button>

        </div>

        <div className="tab-content">

          <p>

            {product.description}

          </p>

        </div>

      </div>

      <Footer />

    </>
  );
}
