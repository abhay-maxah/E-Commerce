import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../stores/useProductStore";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";
import ProductForm from "./CreateProductForm"; // Assuming this is your form component
import { Trash, Star, Pencil } from "lucide-react";

// Memoized ProductRow Component for performance optimization
const ProductRow = React.memo(({ product, index, onEdit, onDelete, onToggleFeatured }) => {
  // Determine the image source: use the first image if available, otherwise an empty string
  const imgSrc = product.images && product.images.length > 0 ? product.images[0] : '';

  return (
    <tr className="hover:bg-red-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {index + 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
        {imgSrc && ( // Only render img tag if imgSrc is not empty
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={imgSrc}
            alt={product.name}
          />
        )}
        <span className="text-sm font-medium">{product.name}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
        {/* Iterate over pricing array to display all prices and weights */}
        {product.pricing.map((priceOption, idx) => (
          <div key={idx}>
            {priceOption.weight !== "default" ? `${priceOption.weight}: ` : ''}₹{Number(priceOption.price).toFixed(2)}
          </div>
        ))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleFeatured(product._id)}
          className={`p-1 rounded-full ${product.isFeatured
            ? "bg-red-500 text-white"
            : "bg-gray-200 text-gray-900"
            } hover:bg-red-500 transition-colors duration-200`}
          aria-label={product.isFeatured ? "Unmark as featured" : "Mark as featured"}
        >
          <Star className="h-5 w-5" />
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 justify-center">
        <button
          onClick={() => onEdit(product)}
          className="text-red-500 hover:text-[#A31621]"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(product._id)}
          className="text-red-500 hover:text-[#A31621]"
          aria-label={`Delete ${product.name}`}
        >
          <Trash className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
});

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
  const [isAdding, setIsAdding] = useState(false); // State to differentiate between add/edit for modal close

  useEffect(() => {
    fetchAllProducts({
      page: currentPage,
      sortBy: sortOption,
      category: categoryFilter,
    });
  }, [currentPage, sortOption, categoryFilter, fetchAllProducts]); // Add fetchAllProducts to dependency array

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on category change
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsAdding(false); // Not adding, but editing
    setIsModalOpen(true);
  };

  const handleProductUpdate = () => {
    setIsModalOpen(false);
    setEditingProduct(null); // Clear editing product after update
    fetchAllProducts({ page: currentPage, sortBy: sortOption, category: categoryFilter }); // Re-fetch current page with filters
  };

  const handleProductAdded = () => {
    setIsModalOpen(false);
    setEditingProduct(null); // Clear editing product after add
    setCurrentPage(1); // Go to the first page to see the new product
    setSortOption("newest"); // Sort by newest to easily find the new product
    setCategoryFilter("all"); // Clear category filter to ensure new product is visible
    fetchAllProducts({ page: 1, sortBy: "newest", category: "all" }); // Re-fetch with default sorting and filter
  };

  return (
    <motion.div
      className="bg-white border border-[#A31621] text-[#A31621] shadow-lg rounded-3xl overflow-hidden max-w-auto mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4">
        <h2 className="text-lg font-semibold text-[#A31621]">Product List</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <label htmlFor="sort-by" className="text-[#A31621] font-medium text-sm sm:text-base">
            Sort by:
          </label>
          <select
            id="sort-by"
            className="border border-[#A31621] p-2 rounded-lg text-[#A31621] bg-transparent focus:outline-none cursor-pointer transition w-full sm:w-auto"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>

          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <label htmlFor="category-filter" className="text-[#A31621] font-medium text-sm sm:text-base">
            Category:
          </label>
          <select
            id="category-filter"
            className="border border-[#A31621] p-2 rounded-lg text-[#A31621] bg-transparent focus:outline-none cursor-pointer transition w-full sm:w-auto"
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
                  <ProductRow
                    key={product._id}
                    product={product}
                    index={index}
                    onEdit={openEditModal}
                    onDelete={deleteProduct}
                    onToggleFeatured={toggleFeaturedProduct}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-[#A31621]">
                        No products found.
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6 z-50"> {/* Added z-50 for modal */}
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