import "./ProductSection.css";
import ProductCard from "./ProductCard";

export default function ProductSection() {
  const products = [
  {
    id: 4,
    image: "/src/public/images/aophongcotton.png",
    name: "Áo Phông Cotton Cơ Bản",
    price: "359.000đ",
    rating: "4.5",
  },
  {
    id: 1,
    image: "/src/public/images/quanjeans.png",
    name: "Quần Jeans Ôm Vừa",
    price: "299.000đ",
    rating: "4.8",
  },
  {
    id: 6,
    image: "/src/public/images/aokhoacbombernu.png",
    name: "Áo Khoác Bomber Nữ",
    price: "429.000đ",
    rating: "4.2",
  },
  {
    id: 10,
    image: "/src/public/images/aosomi.png",
    name: "Áo Sơ Mi",
    price: "250.000đ",
    rating: "4.5",
  },
];

  return (
    <section className="featured-products">

      <div className="section-header">
        <div>
          <h2>Sản phẩm nổi bật</h2>
          <p>Khám phá những sản phẩm được yêu thích nhất</p>
        </div>

        <a href="#">Xem tất cả →</a>
      </div>

      <div className="product-grid">
        {products.map((item, index) => (
          <ProductCard key={index} product={item} />
        ))}
      </div>

    </section>
  );
}
