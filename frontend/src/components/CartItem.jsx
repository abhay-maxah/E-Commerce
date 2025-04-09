import { useState, useMemo } from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { debounce } from "lodash";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const debouncedUpdateQuantity = useMemo(
    () => debounce((id, qty) => updateQuantity(id, qty), 300),
    []
  );

  const debouncedDelete = useMemo(
    () => debounce((id) => removeFromCart(id), 300),
    []
  );

  const handleChangeQuantity = (newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(); // Remove instead of setting quantity to 0
      return;
    }
    setQuantity(newQuantity); // Instant UI update
    debouncedUpdateQuantity(item._id, newQuantity); // Backend update
  };

  const handleRemoveFromCart = () => {
    setIsDeleting(true);
    setIsVisible(false); // Hide for smoother UX
    debouncedDelete(item._id);
  };

  if (!isVisible) return null;

  return (
    <div className="rounded-lg border border-red-500/30 p-4 shadow-sm bg-transparent md:p-6 transition-all duration-300 ease-in-out">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          <img
            className="w-40 h-40 md:w-32 md:h-32 rounded object-cover"
            src={item.image}
            alt={item.name}
          />
        </div>

        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-5 w-5 items-center text-[#A31621] justify-center rounded-md border
              focus:outline-none focus:ring-2 disabled:opacity-50"
              onClick={() => handleChangeQuantity(quantity - 1)}
              disabled={isDeleting}
            >
              <Minus className="text-[#A31621]" />
            </button>

            <p>{quantity}</p>

            <button
              className="inline-flex h-5 w-5 items-center text-[#A31621] justify-center rounded-md border
              focus:outline-none focus:ring-2 disabled:opacity-50"
              onClick={() => handleChangeQuantity(quantity + 1)}
              disabled={isDeleting}
            >
              <Plus className="text-[#A31621]" />
            </button>
          </div>

          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold">Rs.{item.price}</p>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <p className="text-base font-medium hover:underline">{item.name}</p>
          <p className="text-sm">{item.description}</p>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center text-sm font-medium 
              hover:text-red-500 hover:underline disabled:opacity-50"
              onClick={handleRemoveFromCart}
              disabled={isDeleting}
            >
              <Trash />
              {isDeleting && <span className="ml-2 text-xs">Removing...</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
