import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";
const ProductsList = () => {
  const {
    products,
    totalPages,
    fetchAllProducts,
    deleteProduct,
    toggleFeaturedProduct,
    loading,
  } = useProductStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    fetchAllProducts({ page: currentPage, sortBy: sortOption });
  }, [currentPage, sortOption]);

  return (
    <motion.div
      className="bg-white border border-[#A31621] text-[#A31621] shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Sorting & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-b border-[#A31621]">
        <h2 className="text-lg font-semibold text-[#A31621]">Product List</h2>
        <div className="flex items-center gap-2">
          <label className="text-[#A31621] font-medium text-sm sm:text-base">
            Filter by:
          </label>
          <select
            className="border border-[#A31621] p-2 rounded-md text-[#A31621] bg-transparent focus:outline-none cursor-pointer transition"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="price_low_high">Price: Low to High</option>
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner className="w-auto h-auto" />}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse shadow-md">
            <thead className="bg-[#A31621] text-white border border-[#A31621]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-[#A31621]">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.image}
                        alt={product.name}
                      />
                      <span className="text-sm font-medium">
                        {product.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      ${product.price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFeaturedProduct(product._id)}
                        className={`p-1 rounded-full ${
                          product.isFeatured
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        } hover:bg-red-500 transition-colors duration-200`}
                      >
                        <Star className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-500 hover:text-[#A31621]"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-[#A31621]">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </motion.div>
  );
};

export default ProductsList;
