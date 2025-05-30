import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import UserList from "./AnalyticsTab/UserList";
import ProductsList from "./ProductsList";
import TotalSale from "./AnalyticsTab/TotalSale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  const options = { month: "short", day: "numeric" }; // e.g. May 20
  return date.toLocaleDateString("en-US", options);
};

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("graph");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");

        const last7Days = response.data.dailySalesData
          .slice(-7)
          .map((item) => ({
            ...item,
            date: formatDateLabel(item.date), // Convert to "May 20"
          }));

        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(last7Days);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color="from-emerald-500 to-teal-700"
          onClick={() => setSelectedTab("users")}
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color="from-emerald-500 to-green-700"
          onClick={() => setSelectedTab("products")}
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color="from-emerald-500 to-cyan-700"
          onClick={() => setSelectedTab("sales")}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`${analyticsData.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="from-emerald-500 to-lime-700"
          onClick={() => setSelectedTab("graph")}
        />
      </div>

      {selectedTab === "graph" ? (
        <motion.div
          className="bg-gradient-to-br from-red-200 to-red-100 opacity-90 rounded-lg p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#92969c" />
              <XAxis dataKey="date" stroke="#92969c" />
              <YAxis yAxisId="left" stroke="#92969c" />
              <YAxis yAxisId="right" orientation="right" stroke="#92969c" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFEBEE",
                  color: "#A31621",
                }}
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
        </motion.div>
      ) : selectedTab === "products" ? (
        <ProductsList />
      ) : selectedTab === "sales" ? (
        <TotalSale />
      ) : (
        <UserList />
      )}
    </div>
  );
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color, onClick }) => (
  <motion.div
    className={`bg-transparent rounded-lg p-6 shadow-lg overflow-hidden relative {color} cursor-pointer`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className=" text-sm mb-1 font-semibold">{title}</p>
        <h3 className=" text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-400 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-red-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
