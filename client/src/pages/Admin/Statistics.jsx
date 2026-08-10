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

const revenueData = [
  { day: "12/1", revenue: 85000000, orders: 120 },
  { day: "12/2", revenue: 76000000, orders: 118 },
  { day: "12/3", revenue: 92000000, orders: 130 },
  { day: "12/4", revenue: 110000000, orders: 125 },
  { day: "12/5", revenue: 95000000, orders: 140 },
  { day: "12/6", revenue: 72000000, orders: 110 },
  { day: "12/7", revenue: 125000000, orders: 160 },
  { day: "12/8", revenue: 88000000, orders: 145 },
  { day: "12/9", revenue: 115000000, orders: 150 },
  { day: "12/10", revenue: 108000000, orders: 148 },
  { day: "12/11", revenue: 120000000, orders: 170 },
  { day: "12/12", revenue: 132000000, orders: 180 },
  { day: "12/13", revenue: 142000000, orders: 190 },
  { day: "12/14", revenue: 118000000, orders: 175 },
  { day: "12/15", revenue: 82000000, orders: 160 },
  { day: "12/16", revenue: 128000000, orders: 210 },
  { day: "12/17", revenue: 152000000, orders: 230 },
  { day: "12/18", revenue: 160000000, orders: 235 },
  { day: "12/19", revenue: 132000000, orders: 240 },
  { day: "12/20", revenue: 165000000, orders: 250 },
  { day: "12/21", revenue: 148000000, orders: 220 },
  { day: "12/22", revenue: 120000000, orders: 260 },
  { day: "12/23", revenue: 138000000, orders: 275 },
  { day: "12/24", revenue: 145000000, orders: 290 },
  { day: "12/25", revenue: 150000000, orders: 300 },
  { day: "12/26", revenue: 155000000, orders: 310 },
  { day: "12/27", revenue: 140000000, orders: 285 },
  { day: "12/28", revenue: 148000000, orders: 295 },
  { day: "12/29", revenue: 132000000, orders: 260 },
  { day: "12/30", revenue: 118000000, orders: 235 },
];

const categoryData = [
  {
    name: "Giày chạy bộ",
    value: 35,
    color: "#1E3A8A",
  },
  {
    name: "Áo thể thao",
    value: 25,
    color: "#EF4444",
  },
  {
    name: "Phụ kiện",
    value: 20,
    color: "#4ADE80",
  },
  {
    name: "Dụng cụ Gym",
    value: 20,
    color: "#60A5FA",
  },
];

const topProducts = [
  {
    id: 1,
    image: "https://picsum.photos/60?1",
    name: "Giày Nike Air Zoom",
    quantity: 100,
    revenue: "630.000 VND",
  },
  {
    id: 2,
    image: "https://picsum.photos/60?2",
    name: "Áo thể thao Adidas",
    quantity: 20,
    revenue: "499.000 VND",
  },
  {
    id: 3,
    image: "https://picsum.photos/60?3",
    name: "Tất chạy bộ",
    quantity: 14,
    revenue: "303.000 VND",
  },
  {
    id: 4,
    image: "https://picsum.photos/60?4",
    name: "Quần Jogger",
    quantity: 12,
    revenue: "268.000 VND",
  },
  {
    id: 5,
    image: "https://picsum.photos/60?5",
    name: "Áo Hoodie",
    quantity: 10,
    revenue: "250.000 VND",
  },
];

export default function Statistics() {
  return (
    <div className="statistics-page">
      <div className="statistics-header">

  <div></div>

  <select className="statistics-filter">
    <option>Tháng này</option>
    <option>Tuần này</option>
    <option>Năm nay</option>
  </select>

</div>

      <div className="stats-cards">

        <div className="stats-card">
          <div className="stats-info">
            <p>Doanh thu tháng này</p>
            <h2>150.000.000 VND</h2>
            <div className="stats-change">
  <span className="up">↗ 12%</span>
  <span>vs tháng trước</span>
</div>
          </div>

          <div className="stats-icon">
            <FiDollarSign />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <p>Đơn hàng tháng này</p>
            <h2>1,200</h2>
            <div className="stats-change">
  <span className="up">↗ 8%</span>
  <span>vs tháng trước</span>
</div>
          </div>

          <div className="stats-icon">
            <FiShoppingBag />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <p>Tỷ lệ chuyển đổi</p>
            <h2>3.5%</h2>
            <div className="stats-change">
  <span className="up">↗ 0.2%</span>
  <span>vs tuần trước</span>
</div>
          </div>

          <div className="stats-icon">
            <FiPercent />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <p>Lợi nhuận gộp</p>
            <h2>65.000.000 VND</h2>
          </div>

          <div className="stats-icon">
            <FiTrendingUp />
          </div>
        </div>

      </div>

      <div className="statistics-row">

        <div className="statistics-chart">

          <h3>Xu hướng doanh thu & Đơn hàng (30 ngày qua)</h3>

          <ResponsiveContainer width="100%" height={320}>
  <ComposedChart 
  data={revenueData}
  margin={{
    top: 10,
    right: 20,
    left: 35,
    bottom: 0,
  }}
>
    <CartesianGrid
      stroke="#ececec"
      vertical={false}
    />

    <XAxis
      dataKey="day"
    />

    <YAxis
  yAxisId="left"
  width={85}
  domain={[0, 200000000]}
  ticks={[
    0,
    50000000,
    100000000,
    150000000,
    200000000,
  ]}
  tick={{ fill: "#000", fontSize: 12 }}
  axisLine={{ stroke: "#000" }}
  tickLine={{ stroke: "#000" }}
  label={{
    value: "Revenue (VND)",
    angle: -90,
    position: "insideLeft",
    fill: "#000",
    fontSize: 14,
    fontWeight: 600,
    dx: -20,
  }}
  tickFormatter={(value) => value.toLocaleString("vi-VN")}
/>

    <YAxis
  yAxisId="right"
  orientation="right"
  domain={[0, 400]}
  tick={{ fill: "#000", fontSize: 12 }}
  axisLine={{ stroke: "#000" }}
  tickLine={{ stroke: "#000" }}
  label={{
    value: "Order Volume",
    angle: 90,
    position: "insideRight",
    fill: "#000",
    fontSize: 14,
    fontWeight: 600,
    dx: 20,
  }}
/>

    <Tooltip />

    <Legend />

    <Bar
      yAxisId="right"
      dataKey="orders"
      name="Order Volume"
      fill="#8FB6CF"
      barSize={16}
    />

    <Line
      yAxisId="left"
      dataKey="revenue"
      name="Revenue"
      stroke="#333"
      strokeWidth={2}
      type="monotone"
      dot={{
        r: 3,
        fill: "#fff",
        stroke: "#333",
        strokeWidth: 2,
      }}
    />

  </ComposedChart>
</ResponsiveContainer>

        </div>

        <div className="statistics-pie">

          <h3>Sản phẩm bán chạy theo danh mục</h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>

              <Pie
                data={categoryData}
                innerRadius={70}
                outerRadius={105}
                dataKey="value"
              >
                {categoryData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={item.color}
                  />
                ))}
              </Pie>

              <Legend
  formatter={(value, entry) => `${value} ${entry.payload.value}%`}
/>

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="statistics-table">

        <h3>Top 5 sản phẩm bán chạy (tháng này)</h3>

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

            {topProducts.map((item) => (

              <tr key={item.id}>

                <td>
                  <img
                    src={item.image}
                    alt=""
                  />
                </td>

                <td>{item.name}</td>

                <td>{item.quantity}</td>

                <td>{item.revenue}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}