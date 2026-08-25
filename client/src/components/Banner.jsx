import { useState, useEffect } from "react";

const banners = [
  "src/public/images/banner.png",
  "src/public/images/banner2.png",
  "src/public/images/banner3.png",
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000); // đổi ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="banner">
      <img
        src={banners[current]}
        alt={`Banner ${current + 1}`}
      />

      <div className="banner-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </section>
  );
}