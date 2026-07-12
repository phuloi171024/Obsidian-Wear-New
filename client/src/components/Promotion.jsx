import "./Newsletter.css";

export default function Newsletter() {
  return (
    <section className="newsletter">

      <h2>Đăng ký nhận thông tin khuyến mãi</h2>

      <p>
        Đăng ký để nhận thông tin về sản phẩm mới và các chương trình khuyến mãi đặc biệt.
      </p>

      <div className="newsletter-form">

        <input
          type="email"
          placeholder="Email của bạn"
        />

        <button>Đăng ký</button>

      </div>

    </section>
  );
}
