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
import Chart from "./AnalyticsTab/Chart";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("graph");
  const [subTab, setSubTab] = useState("overview");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const handleProductDelete = () => {
    setAnalyticsData((prev) => ({
      ...prev,
      products: prev.products - 1,
    }));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color="from-red-500 to-red-200"
          onClick={() => setSelectedTab("users")}
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color="from-red-500 to-red-200"
          onClick={() => setSelectedTab("products")}
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color="from-red-500 to-red-200"
          onClick={() => setSelectedTab("sales")}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`${analyticsData.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="from-red-500 to-red-200"
          onClick={() => setSelectedTab("graph")}
        />
      </div>

      {/* Tab View */}
      {selectedTab === "graph" ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="flex flex-wrap gap-4">
              {["overview", "category", "status", "top", "monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200
              ${subTab === tab
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"}`}
                >
                  {tab === "overview"
                    ? "Overview (Line Chart)"
                    : tab === "category"
                      ? "By Category"
                      : tab === "status"
                        ? "By Status"
                        : tab === "top"
                          ? "Top Products"
                          : "Monthly Sales"}
                </button>
              ))}
            </div>
          </div>
          {/* Reusable Chart Component */}
          <Chart type={subTab} />
        </>
      ) : selectedTab === "products" ? (
          <ProductsList onProductDelete={handleProductDelete} />
      ) : selectedTab === "sales" ? (
        <TotalSale />
      ) : (
        <UserList />
      )}
    </div>
  );
};

export default AnalyticsTab;

// Stat Card Component
const AnalyticsCard = ({ title, value, icon: Icon, color, onClick }) => (
  <motion.div
    className="bg-transparent rounded-lg p-6 shadow-lg overflow-hidden relative cursor-pointer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onClick={onClick}
  >
    <div className="flex justify-between items-center z-10 relative">
      <div>
        <p className="text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30`} />
    <div className="absolute -bottom-4 -right-4 text-red-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
