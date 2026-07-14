import "./ProductPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const products = [
  {
    id: 1,
    name: "Quần Jeans Ôm Vừa",
    price: "299.000đ",
    image: "/src/public/images/quanjeans.png",
    rating: "4.8",
  },
  {
    id: 2,
    name: "Quần Short Thể Thao",
    price: "599.000đ",
    image: "/src/public/images/quanshortthethao.png",
    rating: "4.9",
  },
  {
    id: 3,
    name: "Quần Jeans Slim Fit",
    price: "499.000đ",
    image: "/src/public/images/quanjeansslimfit.png",
    rating: "5.0",
  },
  {
    id: 4,
    name: "Áo Phông Cotton Cơ Bản",
    price: "359.000đ",
    image: "/src/public/images/aophongcotton.png",
    rating: "5.1",
  },
  {
    id: 5,
    name: "Áo Khoác Denim Nam",
    price: "899.000đ",
    image: "/src/public/images/aokhoacdenimnam.png",
    rating: "5.2",
  },
  {
    id: 6,
    name: "Áo Khoác Bomber Nữ",
    price: "429.000đ",
    image: "/src/public/images/aokhoacbombernu.png",
    rating: "5.3",
  },
  {
    id: 7,
    name: "Quần Shorts Trẻ Em",
    price: "349.000đ",
    image: "/src/public/images/quanshortstreem.png",
    rating: "5.4",
  },
  {
    id: 8,
    name: "Áo Gile Len Nam",
    price: "699.000đ",
    image: "/src/public/images/aogilelennam.png",
    rating: "5.5",
  },
  {
    id: 9,
    name: "Áo Hoodie Unisex",
    price: "699.000đ",
    image: "/src/public/images/aohoodieunisex.png",
    rating: "5.6",
  },
]

export default function ProductPage() {
  return (
    <>
      <Header />

      <div className="product-page">

        {/* Sidebar */}

        <aside className="sidebar">

<div className="filter-title">
        Bộ lọc
    </div>
          <div className="filter-box">
            <h3>Danh mục</h3>

            <label><input type="checkbox" /> Tất cả</label>
            <label><input type="checkbox" /> Áo</label>
            <label><input type="checkbox" /> Quần</label>
            <label><input type="checkbox" /> Túi</label>
            <label><input type="checkbox" /> Giày</label>

          </div>

          <div className="filter-box">
            <h3>Thương hiệu</h3>

            <label><input type="checkbox" /> Adidas</label>
            <label><input type="checkbox" /> CoolMate</label>
            <label><input type="checkbox" /> H&M</label>
            <label><input type="checkbox" /> Levi's</label>
            <label><input type="checkbox" /> Nike</label>
            <label><input type="checkbox" /> Owen</label>
            <label><input type="checkbox" /> Puma</label>

          </div>

          <div className="filter-box">
            <h3>Khoảng giá</h3>

            <label><input type="checkbox" /> Tất cả</label>
            <label><input type="checkbox" /> Dưới 1.000.000đ</label>
            <label><input type="checkbox" /> 1.000.000đ - 2.000.000đ</label>
            <label><input type="checkbox" /> 2.000.000đ - 3.000.000đ</label>
            <label><input type="checkbox" /> Trên 3.000.000đ</label>

          </div>

          <div className="filter-box">
            <h3>Giới tính</h3>

            <label><input type="checkbox" /> Tất cả</label>
            <label><input type="checkbox" /> Nam</label>
            <label><input type="checkbox" /> Nữ</label>
            <label><input type="checkbox" /> Trẻ em</label>
            <label><input type="checkbox" /> Unisex</label>

          </div>

        </aside>

        {/* Content */}

        <section className="product-content">


          <div className="top-bar">

            <h2>Tất cả sản phẩm</h2>

            <select>

              <option>Mặc định</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
              <option>Mới nhất</option>

            </select>

          </div>
          <div className="breadcrumb">
    <span>Trang chủ</span>

    <span className="arrow"> &gt; </span>

    <span className="active">Sản phẩm</span>
</div>

          <div className="shop-product-grid">

    {products.map((product) => (

        <ProductCard
            key={product.id}
            product={product}
        />

    ))}

</div>

        </section>

      </div>

      <Footer />
    </>
  );
}
