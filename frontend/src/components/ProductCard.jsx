import toast from "react-hot-toast";
import { ShoppingCart, Heart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
  } = useWishlistStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const hoverImage = product.images?.[1] || mainImage;
  const firstPrice = product.pricing?.[0]?.price ?? "N/A";
  const firstWeight = product.pricing?.[0]?.weight ?? "";

  // Fix: avoid crash if item.product is null or undefined
  const isInWishlist = wishlist.some((item) => {
    const id = item?.product?._id || item?.product;
    return id === product._id;
  });

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    addToCart(product, firstPrice, firstWeight);
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to use wishlist", { id: "wishlist-login" });
      return;
    }

    if (isInWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product, firstWeight, firstPrice);
    }
  };

  const openProductDetail = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div
      className="flex w-full relative flex-col overflow-hidden rounded-lg border border-red-500/30 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl"
      onClick={openProductDetail}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img
          className="object-cover w-full h-full transition-transform duration-300 ease-in-out"
          src={isHovered ? hoverImage : mainImage}
          alt={product.name}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full hover:bg-gray-100 transition"
        >
          <Heart
            size={20}
            className={`transition-all duration-300 ${isInWishlist ? "text-red-500 scale-110" : "text-gray-600 scale-100"}`}
            fill={isInWishlist ? "red" : "none"}
          />
        </button>
      </div>

      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight truncate w-full overflow-hidden whitespace-nowrap">
          {product.name}
        </h5>

        <div className="mt-2 mb-5 flex items-center justify-between">
          <p className="text-lg font-medium">
            <span className="text-2xl font-bold">Rs.{firstPrice}</span>
          </p>
        </div>

        <button
          className="flex items-center justify-center w-full rounded-lg bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white px-5 py-2.5 text-sm font-medium transition-colors duration-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
