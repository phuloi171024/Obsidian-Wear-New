import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

export default function Products() {
  const products = [
    {
      id: 1,
      image: "/src/public/images/nike.png",
      name: "Giày Nike Zoom",
      sku: "NKZ-M01",
      category: "Giày chạy bộ",
      price: "2,990,000",
      stock: 12,
      status: "Đang bán",
      statusClass: "selling"
    },
    {
      id: 2,
      image: "/src/public/images/adidas.png",
      name: "Áo Adidas Sport",
      sku: "ADS-T02",
      category: "Áo thể thao",
      price: "1,450,000",
      stock: 45,
      status: "Đang bán",
      statusClass: "selling"
    },
    {
      id: 3,
      image: "/src/public/images/quanshortthethao.png",
      name: "Tất Running Combo",
      sku: "RNC-A03",
      category: "Phụ kiện",
      price: "499,000",
      stock: 0,
      status: "Hết hàng",
      statusClass: "out"
    },
    {
      id: 4,
      image: "/src/public/images/quanjeans.png",
      name: "Quần Gym Flex",
      sku: "GFX-P04",
      category: "Quần thể thao",
      price: "1,190,000",
      stock: 20,
      status: "Đang bán",
      statusClass: "selling"
    },
    {
      id: 5,
      image: "/src/public/images/aokhoacdenimnam.png",
      name: "Giày Asics Kayan",
      sku: "AIK-M05",
      category: "Giày chạy bộ",
      price: "3,100,000",
      stock: 5,
      status: "Sắp hết hàng",
      statusClass: "low"
    },
    {
      id: 6,
      image: "/src/public/images/aohoodieunisex.png",
      name: "Áo Hoodie Unisex",
      sku: "AHU-T06",
      category: "Áo thời trang",
      price: "690,000",
      stock: 18,
      status: "Đang bán",
      statusClass: "selling"
    },
    {
      id: 7,
      image: "/src/public/images/quanshortthethao.png",
      name: "Quần Short Thể Thao",
      sku: "QST-P07",
      category: "Quần thể thao",
      price: "450,000",
      stock: 25,
      status: "Đang bán",
      statusClass: "selling"
    },
    {
      id: 8,
      image: "/src/public/images/aophongcotton.png",
      name: "Áo Phông Cotton",
      sku: "APC-T08",
      category: "Áo thời trang",
      price: "390,000",
      stock: 8,
      status: "Đang bán",
      statusClass: "selling"
    },
    {
      id: 9,
      image: "/src/public/images/aokhoacbombernu.png",
      name: "Áo Khoác Bomber",
      sku: "AKB-J09",
      category: "Áo khoác",
      price: "890,000",
      stock: 3,
      status: "Sắp hết hàng",
      statusClass: "low"
    },
    {
      id: 10,
      image: "/src/public/images/aogilelennam.png",
      name: "Áo Gile Len Nam",
      sku: "AGL-M10",
      category: "Áo thời trang",
      price: "590,000",
      stock: 0,
      status: "Hết hàng",
      statusClass: "out"
    }
  ];

  return (
    <div className="products-page">

      {/* ================= TITLE ================= */}

      <div className="products-heading">

        <h1>Quản lí sản phẩm</h1>

        <button className="product-add-btn">
          <FiPlus />
          Thêm sản phẩm mới
        </button>

      </div>


      {/* ================= STATISTICS ================= */}

      <div className="products-stats">

        <div className="product-stat-card">

          <div className="product-stat-content">
            <span>Tổng sản phẩm</span>
            <strong>315</strong>
          </div>

          <div className="product-stat-icon">
            <FiBox />
          </div>

        </div>


        <div className="product-stat-card">

          <div className="product-stat-content">
            <span>Đang bán</span>
            <strong>290</strong>
          </div>

          <div className="product-stat-icon">
            <FiUsers />
          </div>

        </div>


        <div className="product-stat-card">

          <div className="product-stat-content">
            <span>Hết hàng</span>
            <strong>25</strong>
          </div>

          <div className="product-stat-icon">
            <FiShoppingCart />
          </div>

        </div>

      </div>


      {/* ================= FILTER ================= */}

      <div className="products-toolbar">

        <div className="products-filter-item">
          <span>Tất cả trạng thái</span>
          <FiChevronDown />
        </div>

        <div className="products-filter-item">
          <span>Đang bán</span>
          <FiChevronDown />
        </div>

        <div className="products-filter-item">
          <span>Hết hàng</span>
          <FiChevronDown />
        </div>


        <div className="products-search-box">

          <FiSearch />

          <input
            type="text"
            placeholder="Tìm tên sản phẩm, SKU..."
          />

        </div>

      </div>


      {/* ================= TABLE ================= */}

      <div className="products-table-wrapper">

        <table className="products-table">

          <thead>

            <tr>

              <th className="check-column">
                <input type="checkbox" />
              </th>

              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>SKU</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Kho hàng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr key={product.id}>

                <td className="check-column">
                  <input type="checkbox" />
                </td>

                <td>

                  <div className="product-thumbnail">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  </div>

                </td>

                <td className="product-name">
                  {product.name}
                </td>

                <td>
                  {product.sku}
                </td>

                <td>
                  {product.category}
                </td>

                <td className="product-price">
                  {product.price} VND
                </td>

                <td>
                  {product.stock}
                </td>

                <td>

                  <span
                    className={`product-status ${product.statusClass}`}
                  >
                    {product.status}
                  </span>

                </td>

                <td>

                  <div className="product-actions">

                    <button className="product-action">
                      <FiEdit />
                    </button>

                    <button className="product-action">
                      <FiTrash2 />
                    </button>

                    <button className="product-action">
                      <FiEye />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* ================= PAGINATION ================= */}

      <div className="products-bottom">

  <div className="products-pagination">

    <button>
      <FiChevronLeft />
    </button>

    <button className="current">
      1
    </button>

    <button>
      <FiChevronRight />
    </button>

  </div>

</div>

    </div>
  );
}