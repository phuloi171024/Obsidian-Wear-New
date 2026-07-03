import "./Categories.css";

const categories = [
  {
    title: "Áo Phông Cotton Cơ Bản",
    image: "/src/public/images/aophongcotton.png",
  },
  {
    title: "Quần Jeans Ôm Vừa",
    image: "/src/public/images/quanjeans.png",
  },
  {
    title: "Áo Khoác Bomber Nữ",
    image: "/src/public/images/aokhoacbombernu.png",
  },
  {
    title: "Áo Sơ Mi",
    image: "/src/public/images/aosomi.png",
  },
];

export default function Categories() {
  return (
    <section className="featured-products categories-section">

      <div className="section-header">
        <div>
          <h2>Danh mục sản phẩm</h2>
          <p>Tìm kiếm danh mục phù hợp với bạn</p>
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((item, index) => (
          <div
            className="category-card"
            key={index}
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          >
            <div className="overlay">

              <h3>{item.title}</h3>

              <span>Khám phá ngay →</span>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
