import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";

const FeaturedProducts = ({ featuredProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerPage(1);
      else if (width < 1024) setItemsPerPage(2);
      else if (width < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, featuredProducts.length - itemsPerPage)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled =
    currentIndex >= featuredProducts.length - itemsPerPage;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-5xl sm:text-6xl font-bold mb-4">
          Best Seller Products
        </h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {featuredProducts?.map((product) => {
                const firstPrice = product.pricing?.[0];

                const isWishlisted = wishlist.some((item) => {
                  const itemProductId =
                    typeof item.product === "object" && item.product !== null
                      ? item.product._id
                      : item.product;

                  return itemProductId === product._id;
                });


                return (
                  <div
                    key={product._id}
                    className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2 cursor-pointer group"
                    onClick={() => openProductDetail(product._id)}
                  >
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-red-500/30 relative">
                      {/* Wishlist Icon */}
                      {user && (
                        <button
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isWishlisted) {
                              removeFromWishlist(product._id);
                            } else {
                              addToWishlist(
                                product,
                                firstPrice?.weight,
                                firstPrice?.price
                              );
                            }
                          }}
                          title={
                            isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                          }
                        >
                          <Heart
                            className="w-6 h-6 transition-all duration-300"
                            stroke="#A31621"
                            fill={isWishlisted ? "#A31621" : "none"}
                          />
                        </button>
                      )}

                      {/* Product Image */}
                      <div className="overflow-hidden relative w-full h-48">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover transition-opacity duration-300 ease-in-out group-hover:opacity-0 absolute top-0 left-0"
                        />
                        {product.images?.[1] && (
                          <img
                            src={product.images[1]}
                            alt={`${product.name} - hover`}
                            className="w-full h-48 object-cover transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 absolute top-0 left-0"
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-xl font-semibold tracking-tight truncate w-full overflow-hidden whitespace-nowrap mb-2">
                          {product.name}
                        </h3>
                        <p className="font-medium mb-4">
                          ₹{firstPrice?.price?.toFixed(2) ?? "N/A"}
                        </p>

                        {user && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(
                                product,
                                firstPrice?.price,
                                firstPrice?.weight
                              );
                            }}
                            className="w-full bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white font-semibold py-2 px-4 rounded transition-colors duration-300 flex items-center justify-center"
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={isStartDisabled}
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isStartDisabled
                ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#A31621] text-white"
              }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isEndDisabled
                ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#A31621] text-white"
              }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
