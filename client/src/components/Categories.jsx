import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

import aoPhongCotton from "../public/images/aophongcotton1.png";
import quanJeans from "../public/images/quanjeans1.png";
import aoKhoacBomberNu from "../public/images/aokhoacbombernu1.png";
import aoSoMi from "../public/images/aosomi1.png";

import "./Categories.css";

export default function Categories({ categories: suppliedCategories = null }) {
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [loading, setLoading] = useState(suppliedCategories === null);

  const categories = suppliedCategories ?? fetchedCategories;

  const categoryImagesList = [
    aoPhongCotton,
    quanJeans,
    aoKhoacBomberNu,
    aoSoMi,
  ];

  useEffect(() => {
    if (suppliedCategories !== null) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);

        const result = await response.json();

        if (
          result.status ||
          result.success ||
          Array.isArray(result)
        ) {
          setFetchedCategories(result.data || result);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [suppliedCategories]);

  if (loading) {
    return (
      <div className="categories-loading">
        Đang tải danh mục...
      </div>
    );
  }

  return (
    <section className="categories-section">
      <div className="categories-inner">

        <div className="categories-heading">
          <h2>--DANH MỤC SẢN PHẨM--</h2>

          <p>
            Khám phá các dòng sản phẩm nổi bật
          </p>
        </div>

        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.slice(0, 4).map((item, index) => {
              const categoryImage =
                categoryImagesList[index] || aoPhongCotton;

              return (
                <Link
                  key={item.id}
                  to={`/products?category_id=${item.id}`}
                  className="home-category-card"
                >
                  <div className="home-category-image-box">
                    <img
                      src={categoryImage}
                      alt={item.name}
                      className="home-category-image"
                    />
                  </div>

                  <div className="category-content">
                    <h3>{item.name}</h3>

                    <span className="category-explore">
                      Khám phá ngay
                      <FiArrowRight />
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="categories-empty">
              Chưa có danh mục sản phẩm nào.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
