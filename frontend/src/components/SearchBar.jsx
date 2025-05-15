import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useProductStore } from "../stores/useProductStore.js";
import { useNavigate } from "react-router-dom";

let debounceTimer;

const SearchBar = () => {
  const { getAllProductsForSearch, products } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllProductsForSearch();
  }, []);

  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setShowSuggestions(value.trim().length > 0);
    }, 200);
  };

  const handleProductClick = (productId) => {
    setSearchQuery("");
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="relative w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30vw] mx-auto">
      <input
        type="text"
        placeholder="Search products..."
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A31621]"
        value={searchQuery}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      <Search className="absolute right-3 top-2 text-gray-500" size={20} />

      {showSuggestions && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10 max-h-64 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <ul>
              {filteredProducts.map((product) => (
                <li
                  key={product._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleProductClick(product._id)}
                >
                  {product.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-[#A31621] text-sm text-center">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
