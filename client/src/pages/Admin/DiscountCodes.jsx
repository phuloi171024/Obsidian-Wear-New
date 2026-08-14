import { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiTag,
  FiPercent,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const discountCodes = [
  {
    id: 1,
    code: "OBSIDIAN20",
    name: "OBSIDIAN20",
    type: "Giảm giá",
    value: "100.000 VNĐ",
    condition: "Đơn tối thiểu 500.000 VNĐ",
    duration: "Thời hạn 125/500",
    used: 125,
    maxUse: 500,
    status: "Đang hoạt động",
  },
  {
    id: 2,
    code: "GEARUP100K",
    name: "GEARUP100K",
    type: "Giảm giá",
    value: "100.000 VNĐ",
    condition: "Đơn tối thiểu 500.000 VNĐ",
    duration: "Thời hạn 125/500",
    used: 125,
    maxUse: 500,
    status: "Sắp diễn ra",
  },
  {
    id: 3,
    code: "ATHLETE_G15",
    name: "Athlete G15",
    type: "Giảm giá",
    value: "100.000 VNĐ",
    condition: "Đơn tối thiểu 500.000 VNĐ",
    duration: "Thời hạn 125/500",
    used: 125,
    maxUse: 500,
    status: "Hết lượt",
  },
  {
    id: 4,
    code: "FREESHIP",
    name: "Freeship",
    type: "Giảm giá",
    value: "50.000 VNĐ",
    condition: "Đơn tối thiểu 500.000 VNĐ",
    duration: "Thời hạn 125/500",
    used: 125,
    maxUse: 500,
    status: "Hết lượt",
  },
  {
    id: 5,
    code: "MEMBER50",
    name: "Member chương trình",
    type: "Giảm giá",
    value: "50.000 VNĐ",
    condition: "Đơn tối thiểu 500.000 VNĐ",
    duration: "Thời hạn 125/500",
    used: 125,
    maxUse: 500,
    status: "Hết hạn",
  },
  {
    id: 6,
    code: "SPORT10",
    name: "Sport 10",
    type: "Giảm giá",
    value: "100.000 VNĐ",
    condition: "Đơn tối thiểu 300.000 VNĐ",
    duration: "Thời hạn 100/300",
    used: 100,
    maxUse: 300,
    status: "Đang hoạt động",
  },
  {
    id: 7,
    code: "NIKE50K",
    name: "Nike 50K",
    type: "Giảm giá",
    value: "50.000 VNĐ",
    condition: "Đơn tối thiểu 400.000 VNĐ",
    duration: "Thời hạn 80/200",
    used: 80,
    maxUse: 200,
    status: "Đang hoạt động",
  },
  {
    id: 8,
    code: "PUMA100",
    name: "Puma 100K",
    type: "Giảm giá",
    value: "100.000 VNĐ",
    condition: "Đơn tối thiểu 700.000 VNĐ",
    duration: "Thời hạn 50/100",
    used: 50,
    maxUse: 100,
    status: "Đang hoạt động",
  },
  {
    id: 9,
    code: "NEWUSER",
    name: "Khách hàng mới",
    type: "Giảm giá",
    value: "80.000 VNĐ",
    condition: "Đơn tối thiểu 500.000 VNĐ",
    duration: "Thời hạn 40/100",
    used: 40,
    maxUse: 100,
    status: "Đang hoạt động",
  },
  {
    id: 10,
    code: "SUMMER20",
    name: "Summer Sale",
    type: "Giảm giá",
    value: "50.000 VNĐ",
    condition: "Đơn tối thiểu 1.000.000 VNĐ",
    duration: "Thời hạn 20/100",
    used: 20,
    maxUse: 100,
    status: "Sắp diễn ra",
  },
];

export default function DiscountCodes() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);

  // 10 mã / 1 trang
  const itemsPerPage = 10;

  // =========================
  // LỌC DỮ LIỆU
  // =========================

  const filteredCodes = discountCodes.filter((item) => {
    const matchKeyword =
      item.code
        .toLowerCase()
        .includes(keyword.toLowerCase()) ||
      item.name
        .toLowerCase()
        .includes(keyword.toLowerCase());

    const matchFilter =
      filter === "Tất cả" ||
      (filter === "Đang hoạt động" &&
        item.status === "Đang hoạt động") ||
      (filter === "Hết lượt/Hết hạn" &&
        (item.status === "Hết lượt" ||
          item.status === "Hết hạn")) ||
      (filter === "Sắp diễn ra" &&
        item.status === "Sắp diễn ra");

    return matchKeyword && matchFilter;
  });

  // =========================
  // PHÂN TRANG
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCodes.length / itemsPerPage)
  );

  // Nếu đang ở trang lớn hơn tổng số trang
  // thì đưa về trang 1
  const safeCurrentPage =
    currentPage > totalPages ? 1 : currentPage;

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const currentCodes = filteredCodes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =========================
  // LỌC
  // =========================

  const handleFilter = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  // =========================
  // TÌM KIẾM
  // =========================

  const handleSearch = (value) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className="discount-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="discount-page-header">

        <div>
          <h1>Quản lí mã giảm giá</h1>
        </div>

        <button className="discount-add-btn">
          <FiPlus />
          Thêm mã mới
        </button>

      </div>


      {/* =================================================
          THỐNG KÊ
      ================================================= */}

      <div className="discount-statistics">

        {/* Tổng mã */}

        <div className="discount-stat-card">

          <div>
            <span>Tổng mã</span>
            <strong>50</strong>
          </div>

          <FiTag className="discount-stat-icon" />

        </div>


        {/* Đang hoạt động */}

        <div className="discount-stat-card">

          <div>
            <span>Đang hoạt động</span>
            <strong>35</strong>
          </div>

          <FiPercent
            className="discount-stat-icon active-icon"
          />

        </div>


        {/* Hết hạn / Hết lượt */}

        <div className="discount-stat-card">

          <div>
            <span>Hết hạn / Hết lượt</span>
            <strong>15</strong>
          </div>

          <FiClock
            className="discount-stat-icon expired-icon"
          />

        </div>

      </div>


      {/* =================================================
          BỘ LỌC + TÌM KIẾM
      ================================================= */}

      <div className="discount-toolbar">

        <div className="discount-filters">

          {/* Tất cả */}

          <button
            className={
              filter === "Tất cả"
                ? "active"
                : ""
            }
            onClick={() =>
              handleFilter("Tất cả")
            }
          >
            Tất cả
          </button>


          {/* Đang hoạt động */}

          <button
            className={
              filter === "Đang hoạt động"
                ? "active"
                : ""
            }
            onClick={() =>
              handleFilter("Đang hoạt động")
            }
          >
            Đang hoạt động
          </button>


          {/* Hết lượt / Hết hạn */}

          <button
            className={
              filter === "Hết lượt/Hết hạn"
                ? "active"
                : ""
            }
            onClick={() =>
              handleFilter("Hết lượt/Hết hạn")
            }
          >
            Hết lượt/Hết hạn
          </button>


          {/* Sắp diễn ra */}

          <button
            className={
              filter === "Sắp diễn ra"
                ? "active"
                : ""
            }
            onClick={() =>
              handleFilter("Sắp diễn ra")
            }
          >
            Sắp diễn ra
          </button>

        </div>


        {/* SEARCH */}

        <div className="discount-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Tìm mã code, tên..."
            value={keyword}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="discount-table-wrapper">

        <table className="discount-table">

          <thead>

            <tr>

              <th>
                <input type="checkbox" />
              </th>

              <th>Mã code</th>

              <th>Tên chương trình</th>

              <th>Loại giảm giá</th>

              <th>Giá trị</th>

              <th>Điều kiện</th>

              <th>Thời hạn</th>

              <th>Lượt dùng</th>

              <th>Trạng thái</th>

              <th>Thao tác</th>

            </tr>

          </thead>


          <tbody>

            {currentCodes.map((item) => (

              <tr key={item.id}>

                {/* Checkbox */}

                <td>
                  <input type="checkbox" />
                </td>


                {/* Mã */}

                <td>
                  <strong>
                    {item.code}
                  </strong>
                </td>


                {/* Tên chương trình */}

                <td>
                  {item.name}
                </td>


                {/* Loại */}

                <td>
                  {item.type}
                </td>


                {/* Giá trị */}

                <td>
                  {item.value}
                </td>


                {/* Điều kiện */}

                <td>
                  {item.condition}
                </td>


                {/* Thời hạn */}

                <td>
                  {item.duration}
                </td>


                {/* Lượt dùng */}

                <td>
                  {item.used}/{item.maxUse}
                </td>


                {/* Trạng thái */}

                <td>

                  <span
                    className={`discount-status ${
                      item.status ===
                      "Đang hoạt động"
                        ? "status-active"
                        : item.status ===
                          "Sắp diễn ra"
                        ? "status-coming"
                        : item.status ===
                          "Hết lượt"
                        ? "status-used"
                        : "status-expired"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>


                {/* Thao tác */}

                <td>

                  <div className="discount-actions">

                    <button title="Xem">
                      <FiEye />
                    </button>

                    <button title="Sửa">
                      <FiEdit />
                    </button>

                    <button
                      title="Xóa"
                      className="delete"
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                </td>

              </tr>

            ))}


            {/* Không có dữ liệu */}

            {currentCodes.length === 0 && (

              <tr>

                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999",
                  }}
                >
                  Không tìm thấy mã giảm giá
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          PHÂN TRANG
          GIỮ ĐÚNG: < 1 >
      ================================================= */}

      <div className="discount-pagination">

        {/* Nút trái */}

        <button
          disabled={safeCurrentPage === 1}
          onClick={() =>
            setCurrentPage(
              safeCurrentPage - 1
            )
          }
        >
          <FiChevronLeft />
        </button>


        {/* Số trang */}

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (

          <button
            key={page}
            className={
              safeCurrentPage === page
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(page)
            }
          >
            {page}
          </button>

        ))}


        {/* Nút phải */}

        <button
          disabled={
            safeCurrentPage === totalPages
          }
          onClick={() =>
            setCurrentPage(
              safeCurrentPage + 1
            )
          }
        >
          <FiChevronRight />
        </button>

      </div>

    </div>
  );
}