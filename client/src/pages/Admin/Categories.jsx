import { useMemo, useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiUsers,
  FiShoppingCart,
  FiX,
  FiCheck,
  FiMenu,
} from "react-icons/fi";

const initialCategories = [
  {
    id: "001",
    image: "/images/categories/running.jpg",
    name: "Giày chạy bộ",
    description: "Giày chạy bộ nam nữ",
    products: 42,
    status: "Hiển thị",
  },
  {
    id: "002",
    image: "/images/categories/football.jpg",
    name: "Giày đá bóng",
    description: "Giày sân cỏ tự nhiên",
    products: 28,
    status: "Hiển thị",
  },
  {
    id: "003",
    image: "/images/categories/shirt.jpg",
    name: "Áo thể thao",
    description: "Áo tập luyện",
    products: 63,
    status: "Hiển thị",
  },
  {
    id: "004",
    image: "/images/categories/pants.jpg",
    name: "Quần thể thao",
    description: "Quần chạy bộ",
    products: 36,
    status: "Hiển thị",
  },
  {
    id: "005",
    image: "/images/categories/jacket.jpg",
    name: "Áo khoác",
    description: "Áo khoác gió",
    products: 18,
    status: "Ẩn",
  },
  {
    id: "006",
    image: "/images/categories/bag.jpg",
    name: "Ba lô",
    description: "Ba lô thể thao",
    products: 16,
    status: "Hiển thị",
  },
  {
    id: "007",
    image: "/images/categories/bottle.jpg",
    name: "Bình nước",
    description: "Bình giữ nhiệt",
    products: 25,
    status: "Hiển thị",
  },
  {
    id: "008",
    image: "/images/categories/cap.jpg",
    name: "Nón",
    description: "Nón thể thao",
    products: 12,
    status: "Ẩn",
  },
  {
    id: "009",
    image: "/images/categories/glove.jpg",
    name: "Găng tay",
    description: "Găng tập gym",
    products: 15,
    status: "Hiển thị",
  },
  {
    id: "010",
    image: "/images/categories/sock.jpg",
    name: "Vớ",
    description: "Vớ thể thao",
    products: 21,
    status: "Hiển thị",
  },
  {
    id: "011",
    image: "/images/categories/watch.jpg",
    name: "Đồng hồ",
    description: "Đồng hồ thể thao",
    products: 8,
    status: "Hiển thị",
  },
  {
    id: "012",
    image: "/images/categories/yoga.jpg",
    name: "Yoga",
    description: "Phụ kiện Yoga",
    products: 19,
    status: "Hiển thị",
  },
  {
    id: "013",
    image: "/images/categories/swim.jpg",
    name: "Bơi lội",
    description: "Đồ bơi",
    products: 22,
    status: "Hiển thị",
  },
  {
    id: "014",
    image: "/images/categories/basketball.jpg",
    name: "Bóng rổ",
    description: "Thiết bị bóng rổ",
    products: 11,
    status: "Hiển thị",
  },
  {
    id: "015",
    image: "/images/categories/tennis.jpg",
    name: "Tennis",
    description: "Vợt tennis",
    products: 14,
    status: "Ẩn",
  },
  {
    id: "016",
    image: "/images/categories/badminton.jpg",
    name: "Cầu lông",
    description: "Vợt cầu lông",
    products: 32,
    status: "Hiển thị",
  },
  {
    id: "017",
    image: "/images/categories/training.jpg",
    name: "Training",
    description: "Dụng cụ tập",
    products: 20,
    status: "Hiển thị",
  },
  {
    id: "018",
    image: "/images/categories/outdoor.jpg",
    name: "Outdoor",
    description: "Dã ngoại",
    products: 9,
    status: "Hiển thị",
  },
  {
    id: "019",
    image: "/images/categories/cycling.jpg",
    name: "Đạp xe",
    description: "Đồ đạp xe",
    products: 17,
    status: "Hiển thị",
  },
  {
    id: "020",
    image: "/images/categories/gym.jpg",
    name: "Gym",
    description: "Thiết bị Gym",
    products: 27,
    status: "Hiển thị",
  },
];

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    id: "",
    image: "",
    name: "",
    description: "",
    products: 0,
    status: "Hiển thị",
  });

  const filteredData = useMemo(() => {
    return categories.filter((item) => {
      const matchName = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "Tất cả" ||
        item.status === statusFilter;

      return matchName && matchStatus;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

const currentData = filteredData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter]);

  const totalCategories = categories.length;
  const totalVisible = categories.filter(
    (item) => item.status === "Hiển thị"
  ).length;
  const totalHidden = categories.filter(
    (item) => item.status === "Ẩn"
  ).length;  const openAddModal = () => {
    setEditing(null);

    setForm({
      id: String(categories.length + 1).padStart(3, "0"),
      image: "/images/categories/default.jpg",
      name: "",
      description: "",
      products: 0,
      status: "Hiển thị",
    });

    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditing(item.id);
    setForm(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const saveCategory = () => {
    if (form.name.trim() === "") {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    if (editing) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === editing ? form : item
        )
      );
    } else {
      setCategories((prev) => [...prev, form]);
    }

    closeModal();
  };

  const deleteCategory = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    setCategories((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setSelectedRows((prev) =>
      prev.filter((item) => item !== id)
    );
  };

  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(
        selectedRows.filter((item) => item !== id)
      );
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        currentData.map((item) => item.id)
      );
    }
  };

  return (
    <div className="categories-page">

      {/* ================= HEADER ================= */}

      <div className="categories-header">

        <div>

          <h2>Quản lý danh mục</h2>

        </div>

        <button
          className="add-category-btn"
          onClick={openAddModal}
        >
          <FiPlus />
          Tạo danh mục mới
        </button>

      </div>

      {/* ================= STATISTIC ================= */}

      <div className="category-cards">

        <div className="category-card">

          <div>

            <p>Tổng danh mục</p>

            <h1>{totalCategories}</h1>

          </div>

          <div className="card-icon">
            <FiFolder />
          </div>

        </div>

        <div className="category-card">

          <div>

            <p>Đang hiển thị</p>

            <h1>{totalVisible}</h1>

          </div>

          <div className="card-icon">
            <FiUsers />
          </div>

        </div>

        <div className="category-card">

          <div>

            <p>Đã ẩn</p>

            <h1>{totalHidden}</h1>

          </div>

          <div className="card-icon">
            <FiShoppingCart />
          </div>

        </div>

      </div>

      {/* ================= TOOLBAR ================= */}

      <div className="category-toolbar">

        <div className="toolbar-left">

          <label>Lọc trạng thái</label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option>Tất cả</option>
            <option>Hiển thị</option>
            <option>Ẩn</option>
          </select>

        </div>

        <div className="toolbar-right">

          <div className="search-box">

            <FiSearch />

            <input
              type="text"
              placeholder="Tìm tên danh mục..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <button className="filter-menu-btn">

            <FiMenu />

          </button>

        </div>

      </div>      {/* ================= TABLE ================= */}

      <div className="category-table">

        <div className="category-table-scroll">

          <table>

            <thead>

              <tr>

                <th width="50">

                  <input
                    type="checkbox"
                    checked={
  currentData.length > 0 &&
  currentData.every(item =>
    selectedRows.includes(item.id)
  )
}
                    onChange={toggleAll}
                  />

                </th>

                <th width="80">ID</th>

                <th width="90">Hình</th>

                <th width="240">Tên danh mục</th>

                <th>Mô tả</th>

                <th width="120">Số lượng</th>

                <th width="140">Trạng thái</th>

                <th width="130">Thao tác</th>

              </tr>

            </thead>

            <tbody>

              {currentData.map((item) => (

                <tr key={item.id}>

                  <td>

                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => toggleRow(item.id)}
                    />

                  </td>

                  <td>{item.id}</td>

                  <td>

                    <img
                      src={item.image}
                      alt={item.name}
                      className="category-image"
                    />

                  </td>

                  <td>

                    <span className="category-name">

                      {item.name}

                    </span>

                  </td>

                  <td>

                    {item.description}

                  </td>

                  <td>

                    {item.products}

                  </td>

                  <td>

                    <span
                      className={
                        item.status === "Hiển thị"
                          ? "status-badge active"
                          : "status-badge inactive"
                      }
                    >
                      {item.status}
                    </span>

                  </td>

                  <td>

                    <div className="action-group">

                      <button
                        className="edit-btn"
                        onClick={() =>
                          openEditModal(item)
                        }
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteCategory(item.id)
                        }
                      >
                        <FiTrash2 />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {currentData.length === 0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="empty-table"
                  >
                    Không có dữ liệu.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>      
      <div className="pagination">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    &lt;
  </button>

  {Array.from({ length: totalPages }, (_, index) => (
    <button
      key={index}
      className={currentPage === index + 1 ? "active" : ""}
      onClick={() => setCurrentPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}

  <button
    disabled={
      currentPage === totalPages ||
      totalPages === 0
    }
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    &gt;
  </button>
</div>
      {/* ================= MODAL ================= */}

      {showModal && (

        <div className="category-modal">

          <div className="category-modal-content">

            <div className="modal-header">

              <h3>
                {editing
                  ? "Chỉnh sửa danh mục"
                  : "Thêm danh mục"}
              </h3>

              <button
                className="close-modal"
                onClick={closeModal}
              >
                <FiX />
              </button>

            </div>

            <div className="modal-body">

              <div className="form-group">

                <label>Tên danh mục</label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Mô tả</label>

                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>Số sản phẩm</label>

                  <input
                    type="number"
                    value={form.products}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        products: Number(e.target.value),
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label>Trạng thái</label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                  >
                    <option>Hiển thị</option>
                    <option>Ẩn</option>
                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>Đường dẫn hình ảnh</label>

                <input
                  type="text"
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                />

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                className="save-btn"
                onClick={saveCategory}
              >
                <FiCheck />

                {editing ? "Cập nhật" : "Lưu danh mục"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}