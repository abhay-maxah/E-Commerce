import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash, Star, Pencil } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";
import ProductForm from "./CreateProductForm";

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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAllProducts({
      page: currentPage,
      sortBy: sortOption,
      category: categoryFilter,
    });
  }, [currentPage, sortOption, categoryFilter]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleProductUpdate = () => {
    setIsModalOpen(false);
    fetchAllProducts({ page: currentPage, sortBy: sortOption });
  };

  const handleProductAdded = () => {
    setIsModalOpen(false);
    setCurrentPage(1);
    setSortOption("newest");
    fetchAllProducts({ page: 1, sortBy: "newest" });
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <motion.div
      className="bg-white border border-[#A31621] text-[#A31621] shadow-lg rounded-3xl overflow-hidden max-w-5xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 ">
        <h2 className="text-lg font-semibold text-[#A31621]">Product List</h2>
        <div className="flex items-center gap-2">
          <label className="text-[#A31621] font-medium text-sm sm:text-base">
            Filter by:
          </label>
          <select
            className="border border-[#A31621] p-2 rounded-lg text-[#A31621] bg-transparent focus:outline-none cursor-pointer transition"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="price_low_high">Price: Low to High</option>
          </select>

          <label className="text-[#A31621] font-medium text-sm sm:text-base">
            Category:
          </label>
          <select
            className="border border-[#A31621] p-2 rounded-lg text-[#A31621] bg-transparent focus:outline-none cursor-pointer transition"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="all">All</option>
            <option value="Cookies">Cookies</option>
            <option value="Chocolates">Chocolates</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="w-auto h-auto" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full shadow-md rounded-2xl overflow-hidden">
            <thead className="bg-[#A31621] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Sr No
                </th>
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
                products.map((product, index) => (
                  <tr key={product._id} className="hover:bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {index + 1}
                    </td>
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
                      {Number(product.price || 0).toFixed(2)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 justify-center">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-red-500 hover:text-[#A31621]"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
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
                  <td colSpan="6" className="text-center py-4 text-[#A31621]">
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
          <div className="bg-white w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] xl:w-[40vw] max-h-[90vh] overflow-y-auto p-6 rounded-md shadow-lg lg:mt-10 lg:max-w-[600px]">
            <ProductForm
              productToEdit={editingProduct}
              closeModal={isAdding ? handleProductAdded : handleProductUpdate}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductsList;
