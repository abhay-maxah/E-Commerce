import { useState, useMemo, useEffect } from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { debounce } from "lodash";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();
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

  if (!isVisible) return null;

  const imageUrl =
    !imageError && item.image ? item.image : "/placeholder.png";

  const showWeight =
    item.selectedWeight && item.selectedWeight.toLowerCase() !== "default";

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

          <button
            onClick={handleRemoveFromCart}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            <Trash className="w-4 h-4" />
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
