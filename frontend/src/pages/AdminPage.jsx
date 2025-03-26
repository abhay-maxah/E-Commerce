import { BarChart, PlusCircle, ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16 pt-20 md:pt-32 sm:pt-20 lg:pt-20">
        <motion.h1
          className="text-4xl font-bold mb-8  text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-red-700 text-gray-100 hover:bg-red-600"
                  : "bg-transparent border border-[#A31621] text-[#A31621] hover:bg-[#A31621] hover:text-white"
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "create" && <CreateProductForm />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
};
export default AdminPage;
