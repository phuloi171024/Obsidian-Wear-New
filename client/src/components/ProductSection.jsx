import "./ProductSection.css";
import ProductCard from "./ProductCard";

export default function ProductSection() {
  const products = [
    {
      image: "/src/public/images/aophongcotton.png",
      name: "Áo Phông Cotton Cơ Bản",
      price: "250.000 đ",
      rating: "4.5",
    },
    {
      image: "/src/public/images/quanjeans.png",
      name: "Quần Jeans Ôm Vừa",
      price: "650.000 đ",
      rating: "4.8",
    },
    {
      image: "/src/public/images/aokhoacbombernu.png",
      name: "Áo Khoác Bomber Nữ",
      price: "600.000 đ",
      rating: "4.2",
    },
    {
      image: "/src/public/images/aosomi.png",
      name: "Áo Sơ Mi",
      price: "250.000 đ",
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
