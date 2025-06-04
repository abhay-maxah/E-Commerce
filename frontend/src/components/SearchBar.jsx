import { useState, useCallback, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useProductStore } from "../stores/useProductStore.js";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const { searchProducts, getAllProductsForSearch, clearSearch, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch (error) {
        console.error("Error parsing recentSearches:", error);
      }
    }
  }, []);

  const saveRecentSearch = (product) => {
    const updated = [
      product,
      ...recentSearches.filter((item) => item._id !== product._id),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const debouncedSearch = useCallback((query) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.trim().length > 0) {
        getAllProductsForSearch(query.trim());
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        clearSearch();
      }
    }, 700);
  }, [getAllProductsForSearch, clearSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  const handleProductClick = (product) => {
    setSearchQuery("");
    setShowSuggestions(false);
    clearSearch();
    saveRecentSearch(product);
    navigate(`/product/${product._id}`);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleRecentClick = (product) => {
    setSearchQuery("");
    clearSearch();
    setShowSuggestions(false);
    saveRecentSearch(product);
    navigate(`/product/${product._id}`);
  };

  const handleKeyDown = (e) => {
    const list = searchQuery.trim()
      ? searchProducts
      : recentSearches;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < list.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : list.length - 1
      );
    } else if (e.key === "Enter") {
      if (list.length > 0 && selectedIndex !== -1 && !loading) {
        const selectedProduct = list[selectedIndex];
        handleProductClick(selectedProduct);
      }
    }
  };

  return (
    <div className="relative w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30vw] mx-auto">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search products..."
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A31621]"
        value={searchQuery}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (searchQuery.trim().length > 0 || recentSearches.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={handleBlur}
      />
      <Search className="absolute right-3 top-2.5 text-gray-500" size={20} />

      {showSuggestions && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10 max-h-80 overflow-y-auto">

          {/* Recent Searches */}
          {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-gray-500 text-sm font-medium">Recent Searches</div>
              <ul>
                {recentSearches.map((product, index) => (
                  <li
                    key={product._id}
                    className={`px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center space-x-3 ${selectedIndex === index ? "bg-red-100" : ""
                      }`}
                    onMouseDown={() => handleRecentClick(product)}
                  >
                    <img
                      src={
                        (Array.isArray(product.images) && product.images.length > 0
                          ? product.images[0]
                          : product.image) || "/placeholder-image.png"
                      }
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png";
                      }}
                    />
                    <span className="text-sm">{product.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search Suggestions */}
          {searchQuery.trim().length > 0 && (
            <>
              {loading ? (
                <div className="px-4 py-3 text-gray-500 text-sm text-center">Searching...</div>
              ) : searchProducts.length > 0 ? (
                <ul>
                    {searchProducts.map((product, index) => (
                      <li
                        key={product._id}
                        className={`px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center space-x-3 ${selectedIndex === index ? "bg-red-100" : ""
                          }`}
                        onMouseDown={() => handleProductClick(product)}
                      >
                        <img
                          src={product.image || "/placeholder-image.png"}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
                        <span>{product.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-[#A31621] text-sm text-center">
                      No products found for "{searchQuery}"
                    </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
