import { API_BASE_URL } from "../../config/api";
import { useEffect, useRef, useState } from "react";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiPercent,
  FiDollarSign,
} from "react-icons/fi";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

export default function Statistics() {
  const [filter, setFilter] = useState("month");
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const [statsData, setStatsData] = useState({
    revenue: { current: 0, growth: 0 },
    orders: { total: 0, growth: 0 },
    users: { total: 0, new_this_period: 0 },
    products: { total: 0, active: 0 },
    top_products: [],
    revenue_chart: [],
    category_stats: [],
  });

  const categoryColors = [
    "#1E3A8A",
    "#EF4444",
    "#4ADE80",
    "#60A5FA",
    "#A855F7",
    "#F59E0B",
  ];

  const categoryData = (statsData.category_stats || []).map(
    (item, index) => ({
      ...item,
      value: Number(item.value || 0),
      color: categoryColors[index % categoryColors.length],
    })
  );

  // Gọi API lấy dữ liệu thống kê theo bộ lọc thời gian
  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    const fetchStatistics = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/admin/dashboard?filter=${encodeURIComponent(filter)}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.trim()}`,
            },
            signal: controller.signal,
          }
        );

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            result.message || `Không thể tải thống kê (${res.status})`
          );
        }

        if (requestId === requestIdRef.current) {
          setStatsData(result);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (requestId === requestIdRef.current) {
          toast.error(error.message || "Không thể tải dữ liệu thống kê!");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      controller.abort();
    };
  }, [filter]);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const renderGrowth = (growth) => {
    if (filter === "all") {
      return <span>Toàn bộ thời gian</span>;
    }

    if (growth === null || growth === undefined) {
      return <span>Chưa có dữ liệu kỳ trước</span>;
    }

    const numericGrowth = Number(growth);

    return (
      <>
        <span className={numericGrowth >= 0 ? "up" : "down"}>
          {numericGrowth >= 0 ? "↗" : "↘"} {numericGrowth}%
        </span>
        <span>vs cùng khoảng thời gian kỳ trước</span>
      </>
    );
  };

  return (
    <div className="statistics-page">
      <Toaster position="top-right" />

      {/* THANH LỌC THỜI GIAN */}
      <div className="statistics-header">
        <div></div>
        <select 
          className="statistics-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={loading}
        >
          <option value="month">Tháng này</option>
          <option value="week">Tuần này</option>
          <option value="year">Năm nay</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      {/* 4 THẺ THỐNG KÊ */}
      <div className="stats-cards">
        <div className="stats-card">
          <div className="stats-info">
            <p>Doanh thu trong kỳ</p>
            <h2>{formatVND(statsData.revenue.current)}</h2>
            <div className="stats-change">
              {renderGrowth(statsData.revenue.growth)}
            </div>
          </div>
          <div className="stats-icon"><FiDollarSign /></div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <p>Đơn hàng trong kỳ</p>
            <h2>{statsData.orders.total}</h2>
            <div className="stats-change">
              {renderGrowth(statsData.orders.growth)}
            </div>
          </div>
          <div className="stats-icon"><FiShoppingBag /></div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <p>Khách hàng mới</p>
            <h2>{statsData.users.new_this_period}</h2>
            <div className="stats-change">
              <span>Tổng: {statsData.users.total} thành viên</span>
            </div>
          </div>
          <div className="stats-icon"><FiPercent /></div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <p>Tổng sản phẩm</p>
            <h2>{statsData.products.total}</h2>
            <div className="stats-change">
              <span>Đang bán: {statsData.products.active}</span>
            </div>
          </div>
          <div className="stats-icon"><FiTrendingUp /></div>
        </div>
      </div>

      {/* BIỂU ĐỒ */}
      <div className="statistics-row">
        <div className="statistics-chart">
          <h3>Xu hướng doanh thu & Đơn hàng</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={statsData.revenue_chart} margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
              <CartesianGrid stroke="#ececec" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" width={85} tickFormatter={(value) => value.toLocaleString("vi-VN")} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" name="Order Volume" fill="#8FB6CF" barSize={16} />
              <Line yAxisId="left" dataKey="revenue" name="Revenue" stroke="#333" strokeWidth={2} type="monotone" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="statistics-pie">
          <h3>Sản phẩm bán chạy theo danh mục</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={categoryData} innerRadius={70} outerRadius={105} dataKey="value">
                {categoryData.map((item, index) => (<Cell key={index} fill={item.color} />))}
              </Pie>
              <Legend formatter={(value, entry) => `${value}: ${entry.payload.value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BẢNG TOP SẢN PHẨM */}
      <div className="statistics-table">
        <h3>Top 5 sản phẩm bán chạy (trong kỳ)</h3>
        <table>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Doanh thu (VND)</th>
            </tr>
          </thead>
          <tbody>
            {statsData.top_products.length > 0 ? (
              statsData.top_products.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={item.thumbnail || "https://picsum.photos/60"} alt="" style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "4px" }} />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.total_sold}</td>
                  <td>{formatVND(item.revenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#888" }}>Không có dữ liệu trong khoảng thời gian này.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
