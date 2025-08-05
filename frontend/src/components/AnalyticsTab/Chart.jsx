import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Chart = ({ type }) => {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [dataKey, setDataKey] = useState("");
  const [nameKey, setNameKey] = useState("");
  const [chartType, setChartType] = useState("pie");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;

      switch (type) {
        case "overview":
          res = await axios.get("/analytics");
          setData(res.data?.dailySalesData || []);
          setTitle("Overview (Line Chart)");
          setChartType("line");
          break;

        case "category":
          res = await axios.get("/analytics/by-category");
          const categoryData = (res.data || []).map(item => ({
            ...item,
            total: item.totalQuantity,
          }));
          setData(categoryData);
          setTitle("Sales by Category");
          setDataKey("total");
          setNameKey("category");
          setChartType("pie");
          break;

        case "status":
          res = await axios.get("/analytics/by-status");
          setData(res.data || []);
          setTitle("Orders by Status");
          setDataKey("count");
          setNameKey("status");
          setChartType("pie");
          break;

        case "top":
          res = await axios.get("/analytics/top-products");
          const topProducts = (res.data || []).map(item => ({
            name: item.productName,
            count: item.totalQuantity,
          }));
          setData(topProducts);
          setTitle("Top Products");
          setDataKey("count");
          setNameKey("name");
          setChartType("pie");
          break;

        case "monthly":
          res = await axios.get("/analytics/monthly-sales");
          const monthlyData = (res.data || []).map(item => ({
            month: `${monthNames[item.month]} ${item.year}`,
            revenue: item.totalSales,
          }));
          setData(monthlyData);
          setTitle("Sales by Month");
          setDataKey("revenue");
          setNameKey("month");
          setChartType("pie");
          break;

        default:
          throw new Error("Invalid chart type");
      }
    } catch (err) {
      setError("Failed to fetch chart data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);


  if (loading) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow-md text-center text-gray-500">
        Loading {type} chart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 rounded-lg shadow-md text-center text-red-700">
        {error}
      </div>
    );
  }

  const pieChart = (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={Array.isArray(data) ? data : []}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={70}
          outerRadius={150}
          label
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              style={{
                cursor: "pointer",
                outline: "none",
              }}
              tabIndex={-1}
            />
          ))}
        </Pie>



        <Tooltip
          contentStyle={{ backgroundColor: "#ffe3e3", border: "none" }}
          itemStyle={{ color: "#222" }}
          labelStyle={{ fontWeight: "bold", color: "#a31521" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const lineChart = (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={Array.isArray(data) ? data : []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#92969c" />
        <XAxis dataKey="date" stroke="#92969c" />
        <YAxis yAxisId="left" stroke="#92969c" />
        <YAxis yAxisId="right" orientation="right" stroke="#92969c" />
        <Tooltip
          contentStyle={{ backgroundColor: "#ffe3e3", border: "none" }}
          itemStyle={{ color: "#222" }}
          labelStyle={{ fontWeight: "bold", color: "#a31521" }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="sales"
          stroke="#FF1744"
          strokeWidth={3}
          activeDot={{ r: 10, stroke: "#FFF", strokeWidth: 2 }}
          name="Sales"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          stroke="#255ab0"
          strokeWidth={3}
          activeDot={{ r: 10, stroke: "#FFF", strokeWidth: 2 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {chartType === "line" ? lineChart : pieChart}
    </div>
  );
};

export default Chart;
