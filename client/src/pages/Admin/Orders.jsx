import "./Orders.css";
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiMoreHorizontal,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const orders = [
  {
    id: "ORD-0012506",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.850.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Đang giao",
  },
  {
    id: "ORD-0012505",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.750.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Hủy đơn",
  },
  {
    id: "ORD-0012504",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.250.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Chờ xác nhận",
  },
  {
    id: "ORD-0012503",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "2.400.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Đang giao",
  },
  {
    id: "ORD-0012502",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.490.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Đang giao",
  },
  {
    id: "ORD-0012501",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.850.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Hủy đơn",
  },
  {
    id: "ORD-0012500",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.330.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Chờ xác nhận",
  },
  {
    id: "ORD-0012499",
    date: "20/11/2023 10:30",
    customer: "Phi Nguyen",
    total: "1.490.000 VND",
    payment: "COD/Chuyển khoản",
    status: "Đã giao",
  },
];

export default function Orders() {
  const badgeClass = (status) => {
    switch (status) {
      case "Đang giao":
        return "badge shipping";
      case "Hủy đơn":
        return "badge cancel";
      case "Chờ xác nhận":
        return "badge pending";
      default:
        return "badge success";
    }
  };

  return (
    <div className="orders-page">

      <div className="orders-header">

        <div>
          <h2>Quản lí đơn hàng</h2>
        </div>

        <div className="header-action">

          <button className="icon-btn">
            <FiMoreHorizontal />
          </button>

          <button className="add-btn">
            Tạo đơn mới
          </button>

          <button className="excel-btn">
            <FiDownload />
            Xuất Excel
          </button>

        </div>

      </div>

      <div className="filter-bar">

        <div className="filter-box">
          <FiCalendar />
          <span>20/11/2023 10:30</span>
        </div>

        <select>
          <option>Trạng thái: COD/Chuyển</option>
        </select>

        <select>
          <option>Khách hàng tạo</option>
        </select>

        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Khách hàng"
          />
        </div>

        <button className="filter-btn">
          <FiFilter />
        </button>

      </div>

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>
              <th>Mã đơn hàng</th>
              <th>Ngày tạo</th>
              <th>Khách hàng</th>
              <th>Tổng tiền (VND)</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
            </tr>

          </thead>

          <tbody>

            {orders.map((item) => (

              <tr key={item.id}>

                <td>{item.id}</td>

                <td>{item.date}</td>

                <td>{item.customer}</td>

                <td>{item.total}</td>

                <td>{item.payment}</td>

                <td>
                  <span className={badgeClass(item.status)}>
                    {item.status}
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="pagination">

        <button>
          <FiChevronLeft />
        </button>

        <button className="active">
          1
        </button>

        <button>2</button>

        <button>3</button>

        <span>...</span>

        <button>50</button>

        <button>
          <FiChevronRight />
        </button>

      </div>

    </div>
  );
}