import "./Policy.css";
import {
  FiTruck,
  FiShield,
  FiCreditCard,
  FiStar,
} from "react-icons/fi";

export default function Policy() {
  return (
    <section className="policy">

      <div className="policy-item">
        <FiTruck className="policy-icon" />
        <div>
          <h3>MIỄN PHÍ VẬN CHUYỂN</h3>
          <p>Áp dụng cho đơn hàng từ 500.000đ</p>
        </div>
      </div>

      <div className="policy-item">
        <FiShield className="policy-icon" />
        <div>
          <h3>BẢO HÀNH CHÍNH HÃNG</h3>
          <p>Cam kết sản phẩm chính hãng 100%</p>
        </div>
      </div>

      <div className="policy-item">
        <FiCreditCard className="policy-icon" />
        <div>
          <h3>THANH TOÁN AN TOÀN</h3>
          <p>Tiền mặt • Chuyển khoản • Ví điện tử</p>
        </div>
      </div>

      <div className="policy-item">
        <FiStar className="policy-icon" />
        <div>
          <h3>ĐỔI TRẢ DỄ DÀNG</h3>
          <p>Hỗ trợ đổi trả trong vòng 7 ngày</p>
        </div>
      </div>

    </section>
  );
}