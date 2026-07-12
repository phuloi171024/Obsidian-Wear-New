import "./Brands.css";

export default function Brands() {
  const brands = [
    "/src/public/images/adidas.png",
    "/src/public/images/coolmate.png",
    "/src/public/images/H&M.png",
    "/src/public/images/Levi's.png",
    "/src/public/images/nike.png",
    "/src/public/images/Owen.png",
    "/src/public/images/puma.png",
  ];

  return (
    <section className="brands">

      <div className="brand-panel">

        <div className="brand-header">
          <h2>Thương hiệu nổi tiếng</h2>
          <p>Chúng tôi chỉ cung cấp các tín hiệu thương mại</p>
        </div>

        <div className="brand-list">
          {brands.map((item, index) => (
            <div className="brand-card" key={index}>
              <img src={item} alt="brand" />
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
