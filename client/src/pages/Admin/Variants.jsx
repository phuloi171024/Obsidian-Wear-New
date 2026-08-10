import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiSave,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiBox,
  FiShoppingBag,
  FiXCircle,
  FiAlertTriangle
} from "react-icons/fi";

export default function Variants() {
  const variants = [
  {
    id: 1,
    image: "/src/public/images/aohoodieunisex.png",
    productName: "Áo Hoodie Unisex",
    sku: "Quần Jeans Ôm Vừa",
    size: "M",
    color: "Đen",
    colorClass: "black",
    price: "450.000",
    stock: 15,
    status: "Đang bán",
    statusClass: "selling"
  },
  {
    id: 2,
    image: "/src/public/images/aohoodieunisex.png",
    productName: "Áo Hoodie Unisex",
    sku: "Quần Short Thể Thao",
    size: "L",
    color: "Đen",
    colorClass: "black",
    price: "450.000",
    stock: 10,
    status: "Đang bán",
    statusClass: "selling"
  },
  {
    id: 3,
    image: "/src/public/images/aohoodieunisex.png",
    productName: "Áo Hoodie Unisex",
    sku: "Quần Jeans Slim Fit",
    size: "M",
    color: "Trắng",
    colorClass: "white",
    price: "450.000",
    stock: 8,
    status: "Đang bán",
    statusClass: "selling"
  },
  {
    id: 4,
    image: "/src/public/images/aohoodieunisex.png",
    productName: "Áo Hoodie Unisex",
    sku: "Áo Phông Cotton Cơ Bản",
    size: "L",
    color: "Trắng",
    colorClass: "white",
    price: "450.000",
    stock: 3,
    status: "Sắp hết hàng",
    statusClass: "low"
  },
  {
    id: 5,
    image: "/src/public/images/quanjeansslimfit.png",
    productName: "Quần Jeans Slim Fit",
    sku: "Áo Khoác Denim Nam",
    size: "M",
    color: "Xanh",
    colorClass: "blue",
    price: "590.000",
    stock: 12,
    status: "Đang bán",
    statusClass: "selling"
  },
  {
    id: 6,
    image: "/src/public/images/quanjeansslimfit.png",
    productName: "Quần Jeans Slim Fit",
    sku: "Áo Khoác Bomber Nữ",
    size: "XL",
    color: "Xanh",
    colorClass: "blue",
    price: "590.000",
    stock: 7,
    status: "Đang bán",
    statusClass: "selling"
  },
  {
    id: 7,
    image: "/src/public/images/quanjeansslimfit.png",
    productName: "Quần Jeans Slim Fit",
    sku: "Quần Shorts Trẻ Em",
    size: "L",
    color: "Đen",
    colorClass: "black",
    price: "590.000",
    stock: 2,
    status: "Sắp hết hàng",
    statusClass: "low"
  },
  {
    id: 8,
    image: "/src/public/images/quanjeansslimfit.png",
    productName: "Quần Jeans Slim Fit",
    sku: "Áo Gile Len Nam",
    size: "XL",
    color: "Đen",
    colorClass: "black",
    price: "590.000",
    stock: 0,
    status: "Hết hàng",
    statusClass: "out"
  }
  ];

  return (
    <div className="variants-page">

      {/* SEARCH */}
      <div className="variants-search">
        <FiSearch />

        <input
          type="text"
          placeholder="Tìm kiếm biến thể..."
        />
      </div>

      {/* STATISTICS */}
      <div className="variants-stats">

        <div className="variant-stat total">
          <div>
            <span>Tổng số biến thể</span>
            <strong>37</strong>
          </div>

          <div className="stat-icon total-icon">
  <FiBox />
</div>
        </div>

        <div className="variant-stat selling-card">
          <div>
            <span>Biến thể đang bán</span>
            <strong>34</strong>
          </div>

          <div className="stat-icon selling-icon">
  <FiShoppingBag />
</div>
        </div>

        <div className="variant-stat out-card">
          <div>
            <span>Biến thể hết hàng</span>
            <strong>0</strong>
          </div>

          <div className="stat-icon out-icon">
  <FiXCircle />
</div>
        </div>

        <div className="variant-stat low-card">
          <div>
            <span>Biến thể sắp hết hàng</span>
            <strong>3</strong>
          </div>

          <div className="stat-icon low-icon">
  <FiAlertTriangle />
</div>
        </div>

      </div>

      {/* TITLE + BUTTON */}
      <div className="variants-heading">

        <div>
          <h1>Quản lí biến thể sản phẩm</h1>
          <p>
            Product: <strong>Giày chạy bộ Nike Zoom</strong>
          </p>
        </div>

        <div className="variants-heading-buttons">

          <button className="variant-save-btn">
            <FiSave />
            Lưu thay đổi
          </button>

          <button className="variant-add-btn">
            <FiPlus />
            Thêm biến thể mới
          </button>

        </div>

      </div>

      {/* TABLE */}
      <div className="variants-table-wrapper">

        <table className="variants-table">

          <thead>
            <tr>

              <th className="check-column">
                <input type="checkbox" />
              </th>

              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Kích thước</th>
              <th>Màu sắc</th>
              <th>Giá (VNĐ)</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>

            </tr>
          </thead>

          <tbody>

            {variants.map((item) => (
              <tr key={item.id}>

                <td className="check-column">
                  <input type="checkbox" />
                </td>

                <td>
                  <div className="variant-thumbnail">
                    <img
                      src={item.image}
                      alt={item.sku}
                    />
                  </div>
                </td>

                <td className="variant-sku">
                  {item.sku}
                </td>

                <td>
                  {item.size}
                </td>

                <td>
                  {item.color}
                </td>

                <td className="variant-price">
                  {item.price}đ
                </td>

                <td>
                  {item.stock}
                </td>

                <td>
                  <span
                    className={`variant-status ${item.statusClass}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>

                  <div className="variant-actions">

                    <button
                      className="variant-action edit"
                      title="Chỉnh sửa"
                    >
                      <FiEdit />
                    </button>

                    <button
                      className="variant-action delete"
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>

                    <button
                      className="variant-action view"
                      title="Xem"
                    >
                      <FiEye />
                    </button>

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* BOTTOM */}
      <div className="variants-bottom">

        <div className="variants-bulk">

          <select defaultValue="">
            <option value="" disabled>
              Bulk thay đổi...
            </option>

            <option>
              Đổi trạng thái
            </option>

            <option>
              Xóa biến thể
            </option>
          </select>

          <select defaultValue="">
            <option value="" disabled>
              Thêm biến thể mới
            </option>

            <option>
              Thêm biến thể
            </option>
          </select>

        </div>

        <div className="variants-pagination">

          <button>
            <FiChevronsLeft />
          </button>

          <button>
            <FiChevronLeft />
          </button>

          <button className="current">
            1
          </button>

          <button>
            <FiChevronRight />
          </button>

          <button>
            <FiChevronsRight />
          </button>

        </div>

      </div>

    </div>
  );
}