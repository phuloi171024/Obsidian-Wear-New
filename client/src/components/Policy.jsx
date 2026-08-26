import { Link } from "react-router-dom";
import "./Policy.css";

export default function Policy() {
  const sports = [
    {
      title: "CHẠY BỘ",
      description: "Sẵn sàng bứt phá mọi giới hạn",
      image: "/images/aogilelennam.png",
      link: "/products",
    },
    {
      title: "TẬP LUYỆN",
      description: "Nâng cấp phong độ mỗi ngày",
      image: "/images/quanshortthethao.png",
      link: "/products",
    },
    {
      title: "THỜI TRANG THỂ THAO",
      description: "Phong cách năng động cho mọi chuyển động",
      image: "/images/aohoodieunisex.png",
      link: "/products",
    },
  ];

  return (
    <section className="sports-section">
      <div className="sports-inner">

        <div className="sports-heading">
          <h2>--KHÁM PHÁ THEO PHONG CÁCH--</h2>
          <p>Lựa chọn phong cách phù hợp với bạn</p>
        </div>

        <div className="sports-grid">
          {sports.map((sport, index) => (
            <Link
              to={sport.link}
              className="sports-card"
              key={index}
            >
              <img
                src={sport.image}
                alt={sport.title}
                className="sports-card-image"
              />

              <div className="sports-overlay"></div>

              <div className="sports-content">
                <h3>{sport.title}</h3>

                <p>{sport.description}</p>

                <span className="sports-link">
                  KHÁM PHÁ NGAY
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
