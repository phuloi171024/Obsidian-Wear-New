import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

// IMPORT HÌNH ẢNH TỪ THƯ MỤC CỦA EM
import aoPhongCotton from "../public/images/aophongcotton1.png";
import quanJeans from "../public/images/quanjeans1.png";
import aoKhoacBomberNu from "../public/images/aokhoacbombernu1.png";
import aoSoMi from "../public/images/aosomi1.png";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // MẢNG CHỨA CÁC HÌNH ẢNH ĐÃ IMPORT (Theo thứ tự)
  const categoryImagesList = [
    aoPhongCotton,    // Ảnh cho danh mục số 1 (index 0)
    quanJeans,        // Ảnh cho danh mục số 2 (index 1)
    aoKhoacBomberNu,  // Ảnh cho danh mục số 3 (index 2)
    aoSoMi,           // Ảnh cho danh mục số 4 (index 3)
  ];

  // 1. GỌI API LẤY DANH SÁCH DANH MỤC TỪ BACKEND
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/categories");
        const result = await response.json();

        if (result.status || result.success || Array.isArray(result)) {
          setCategories(result.data || result);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
        Đang tải danh mục...
      </div>
    );
  }

  return (
    <section className="categories-section" style={{ padding: "40px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "24px",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Danh Mục Sản Phẩm
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {categories.length > 0 ? (
            // Thêm tham số `index` vào hàm map để lấy thứ tự (0, 1, 2, 3...)
            categories.map((item, index) => {
              
              // Gán ảnh theo thứ tự index. Nếu hết ảnh trong mảng thì lấy ảnh mặc định.
              const categoryImage =
                categoryImagesList[index] ||
                "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop";

              return (
                <div
                  key={item.id}
                  style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    height: "220px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s ease",
                  }}
                  className="category-card"
                >
                  {/* Ảnh nền danh mục */}
                  <img
                    src={categoryImage}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "brightness(0.7)",
                    }}
                  />

                  {/* Lớp phủ thông tin */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "20px",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      color: "#ffffff",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        margin: "0 0 8px 0",
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* NÚT KHÁM PHÁ NGAY CHUYỂN HƯỚNG THEO CATEGORY_ID */}
                    <Link
                      to={`/products?category_id=${item.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#38bdf8",
                        fontWeight: "600",
                        fontSize: "14px",
                        textDecoration: "none",
                        width: "fit-content",
                      }}
                    >
                      <span>Khám phá ngay</span>
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", gridColumn: "1 / -1", color: "#64748b" }}>
              Chưa có danh mục sản phẩm nào.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}