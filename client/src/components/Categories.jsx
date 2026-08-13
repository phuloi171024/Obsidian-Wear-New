import "./Categories.css";

import aoPhongCotton from "../public/images/aophongcotton.png";
import quanJeans from "../public/images/quanjeans.png";
import aoKhoacBomberNu from "../public/images/aokhoacbombernu.png";
import aoSoMi from "../public/images/aosomi.png";

const categories = [
  {
    title: "Áo Phông Cotton Cơ Bản",
    image: aoPhongCotton,
  },
  {
    title: "Quần Jeans Ôm Vừa",
    image: quanJeans,
  },
  {
    title: "Áo Khoác Bomber Nữ",
    image: aoKhoacBomberNu,
  },
  {
    title: "Áo Sơ Mi",
    image: aoSoMi,
  },
];

export default function Categories() {
  return (
    <section className="categories-section">

      <div className="section-header">
        <h2>Danh mục sản phẩm</h2>
        <p>Tìm kiếm danh mục phù hợp với bạn</p>
      </div>

      <div className="categories-grid">
        {categories.map((item, index) => (
          <div
            className="home-category-card"
            key={index}
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          >
            <div className="overlay">
              <h3>{item.title}</h3>
              <button type="button" className="explore-button">
                Khám phá ngay →
              </button>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}