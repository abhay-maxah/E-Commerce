import { useEffect } from "react";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useCartStore } from "../stores/useCartStore";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { wishlist, getWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  const handleStartShopping = () => {
    navigate("/");
  };

  const handleAddToCart = (product, price, weight) => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "wishlist-login" });
      return;
    }

    addToCart(product, price, weight);
  };

  const validWishlist = wishlist.filter((item) => item?.product);

  return (
    <div className="mt-24 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center text-[#A31621] mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Wishlist
      </motion.h1>

      {validWishlist.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heart className="h-24 w-24 text-gray-300" />
          <h3 className="text-2xl font-semibold text-gray-800">Your wishlist is empty</h3>
          <p className="text-gray-500">Looks like you haven’t saved anything yet.</p>
          <button
            className="mt-4 rounded-md border border-[#A31621] text-[#A31621] hover:bg-[#A31621] hover:text-white px-6 py-2 transition"
            onClick={handleStartShopping}
          >
            Start Shopping
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {validWishlist.map((item, index) => {
            const product = item.product;
            const mainImage = product?.images?.[0] || "/placeholder.jpg";
            const price = item.selectedPrice;
            const weight = item.selectedWeight;

            return (
              <motion.div
                key={item._id || `${product._id}-${index}`}
                className="relative flex flex-col overflow-hidden rounded-lg border border-red-500/30 shadow-lg transition-all duration-300 hover:shadow-xl bg-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/product/${product._id}`} className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-10" />
                </Link>

                {/* Trash Icon (Remove from Wishlist) */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full hover:bg-gray-100 transition"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={18} className="text-red-500 hover:text-red-600" />
                </button>

                <div className="mt-4 px-5 pb-5">
                  <h5 className="text-lg font-semibold tracking-tight truncate w-full overflow-hidden whitespace-nowrap text-[#A31621]">
                    {product.name}
                  </h5>
                  <p className="text-sm text-gray-700 mt-1">Weight: {weight}</p>

                  <div className="mt-3 mb-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-[#A31621]">Rs.{price}</span>
                  </div>

                  <button
                    className="flex items-center justify-center w-full rounded-lg bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white px-5 py-2.5 text-sm font-medium transition-colors duration-300"
                    onClick={() => handleAddToCart(product, price, weight)}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    Add to cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default WishlistPage;
