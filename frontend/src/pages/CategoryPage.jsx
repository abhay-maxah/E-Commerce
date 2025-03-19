import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination"; // Import Pagination Component

const CategoryPage = () => {
  const { fetchProductsByCategory, products, isLoading, totalPages } =
    useProductStore();
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 12);

  useEffect(() => {
    if (category) {
      fetchProductsByCategory(category, sortBy, currentPage, limit); // Fetch with sorting & pagination
    }
  }, [category, sortBy, currentPage, limit]);

  // Handle sorting change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setSearchParams({ sortBy: event.target.value, page: 1, limit });
    setCurrentPage(1);
  };

  // Handle limit change
  const handleLimitChange = (event) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    setSearchParams({ sortBy, page: 1, limit: newLimit });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto py-10">
          {/* Category Title */}
          <motion.h1
            className="text-center text-4xl sm:text-5xl font-bold mb-8 mt-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.h1>

          {/* Filters Section */}
          <div className="bg-transparent p-4 rounded-lg shadow-md mb-6 border border-[#A31621]">
            <h2 className="text-[#A31621] text-lg font-semibold mb-2">
              Filters
            </h2>
            <div className="flex flex-wrap justify-between items-center space-x-4">
              {/* Sorting Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-[#A31621] font-medium">Sort By:</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-[#A31621] rounded-md px-4 py-2 text-[#A31621]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="price_low_high">Price: Low to High</option>
                </select>
              </div>

              {/* Limit Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-[#A31621] font-medium">
                  Items per page:
                </label>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="border border-[#A31621] rounded-md px-4 py-2 text-[#A31621]"
                >
                  <option value="6">6 per page</option>
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loader */}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {products.length === 0 ? (
                <h2 className="text-3xl font-semibold text-left col-span-full">
                  No products found
                </h2>
              ) : (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              )}
            </motion.div>
          )}

          {/* Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={(page) => {
                setCurrentPage(page);
                setSearchParams({ sortBy, page, limit });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
