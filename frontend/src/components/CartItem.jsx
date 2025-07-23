import { useState, useMemo, useEffect } from "react";
import { Minus, Plus, Trash, Heart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { debounce } from "lodash";
import toast from "react-hot-toast";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();
  const { addToWishlist, wishlist } = useWishlistStore();

  const [quantity, setQuantity] = useState(item.quantity);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const debouncedUpdateQuantity = useMemo(
    () => debounce((cartItemId, qty) => updateQuantity(cartItemId, qty), 300),
    [updateQuantity]
  );

  const debouncedDelete = useMemo(
    () => debounce((cartItemId) => removeFromCart(cartItemId), 300),
    [removeFromCart]
  );

  const handleChangeQuantity = (newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart();
      return;
    }
    setQuantity(newQuantity);
    debouncedUpdateQuantity(item._id, newQuantity);
  };

  const handleRemoveFromCart = () => {
    setIsDeleting(true);
    setIsVisible(false);
    debouncedDelete(item._id);
  };

  // We assume that the cart item contains a "product" field with full product details.
  const productObject = item.product || item; // Fallback in case product info is not nested
  const productId = productObject?._id;

  // Safely check wishlist: compare product _id (whether product is an object or ID)
  const isWishlisted = wishlist.some((wish) => {
    const wishProductId =
      typeof wish.product === "object" && wish.product !== null
        ? wish.product._id
        : wish.product;
    return wishProductId === productId;
  });

  const handleAddToWishlist = async () => {
    const fallbackProductObject =
      typeof item.product === "object" && item.product !== null
        ? item.product
        : { _id: item.product || item._id };
    const isWishlisted = wishlist.some((wish) => {
      const wishProductId =
        typeof wish.product === "object" && wish.product !== null
          ? wish.product._id
          : wish.product;
      return wishProductId === fallbackProductObject._id;
    });

    // if (isWishlisted) {
    //   handleRemoveFromCart();
    //   return;
    // }

    try {
      await addToWishlist(
        fallbackProductObject,
        item.selectedWeight,
        item.selectedPrice
      );
      // handleRemoveFromCart();
    } catch (err) {
      toast.error("Failed to add to wishlist");
    }
  };

  if (!isVisible) return null;

  const imageUrl = !imageError && item.image ? item.image : "/placeholder.png";
  const showWeight =
    item.selectedWeight &&
    item.selectedWeight.toLowerCase() !== "default";

  return (
    <div className="rounded-lg border border-red-500/30 p-4 md:p-6 shadow-sm bg-transparent transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Image */}
        <div className="shrink-0 md:order-1">
          <img
            src={imageUrl}
            alt={item.name || "Product Image"}
            onError={() => setImageError(true)}
            className="w-28 h-28 rounded-md object-cover border border-gray-300"
          />
        </div>

        {/* Quantity & Price */}
        <div className="flex items-center justify-between md:order-3 md:justify-end gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <button
              className="h-7 w-7 flex items-center justify-center rounded-md border text-[#A31621] hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
              onClick={() => handleChangeQuantity(quantity - 1)}
              disabled={isDeleting}
            >
              <Minus className="w-4 h-4" />
            </button>
            <p className="min-w-[20px] text-center">{quantity}</p>
            <button
              className="h-7 w-7 flex items-center justify-center rounded-md border text-[#A31621] hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
              onClick={() => handleChangeQuantity(quantity + 1)}
              disabled={isDeleting}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-end min-w-[100px]">
            <p className="text-base font-semibold">
              ₹{(item.selectedPrice || 0) * quantity}
            </p>
            <p className="text-sm text-gray-500">
              ₹{item.selectedPrice || 0} x {quantity}
            </p>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-2 md:order-2">
          <p className="text-base font-medium leading-tight hover:underline line-clamp-1">
            {item.name}
          </p>
          {showWeight && (
            <p className="text-sm text-gray-500">Weight: {item.selectedWeight}</p>
          )}
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleRemoveFromCart}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              <Trash className="w-4 h-4" />
              {isDeleting ? "Removing..." : "Remove"}
            </button>

            {/* <button
              onClick={handleAddToWishlist}
              disabled={isDeleting || isWishlisted}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              <Heart className="w-4 h-4" />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
