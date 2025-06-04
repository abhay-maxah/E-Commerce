import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupons");
      set({ coupon: response.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/coupons/validate", { code });
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },


  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data.cart });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  clearCart: async () => {
    try {
      await axios.delete("/cart/clean");
      set({ cart: [], coupon: null, total: 0, subtotal: 0, isCouponApplied: false });
      toast.success("Purchase successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  // addToCart: async (product, selectedPrice, selectedWeight) => {
  //   try {
  //     const response = await axios.post("/cart", {
  //       productId: product._id,
  //       selectedPrice,
  //       selectedWeight,
  //     });

  //     toast.success(response.data.message || "Product added to cart");

  //     // The backend now sends back the specific cartItem that was added or updated
  //     const addedOrUpdatedItem = response.data.cartItem;

  //     if (!addedOrUpdatedItem) {
  //       throw new Error("Could not find added/updated item in cart response");
  //     }

  //     set((prevState) => {
  //       // Check if the item (identified by its _id from the backend) already exists in the local state
  //       const existingItemIndex = prevState.cart.findIndex(
  //         (item) => item._id === addedOrUpdatedItem._id
  //       );

  //       let newCart;

  //       if (existingItemIndex > -1) {
  //         // If the item exists, update its quantity (and other details if needed, though quantity is usually the only change here)
  //         newCart = prevState.cart.map((item, index) =>
  //           index === existingItemIndex
  //             ? { ...item, quantity: addedOrUpdatedItem.quantity }
  //             : item
  //         );
  //       } else {
  //         // If the item is new, append it to the cart
  //         // Construct the item for the local state using the enriched data from the backend
  //         newCart = [
  //           ...prevState.cart,
  //           {
  //             _id: addedOrUpdatedItem._id,
  //             product: addedOrUpdatedItem.product, // Include product ID for consistent data structure
  //             name: addedOrUpdatedItem.name,
  //             image: addedOrUpdatedItem.image,
  //             description: addedOrUpdatedItem.description,
  //             selectedWeight: addedOrUpdatedItem.selectedWeight,
  //             selectedPrice: addedOrUpdatedItem.selectedPrice,
  //             quantity: addedOrUpdatedItem.quantity,
  //           },
  //         ];
  //       }

  //       return { cart: newCart };
  //     });

  //     get().calculateTotals();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "An error occurred");
  //   }
  // },
  addToCart: async (product, selectedPrice, selectedWeight) => {
    try {
      const response = await axios.post("/cart", {
        productId: product._id,
        selectedPrice,
        selectedWeight,
      });

      toast.success(response.data.message || "Product added to cart");

      const addedOrUpdatedItem = response.data.cartItem;

      if (!addedOrUpdatedItem) {
        throw new Error("Could not find added/updated item in cart response");
      }

      set((prevState) => {
        const existingItemIndex = prevState.cart.findIndex(
          (item) =>
            item.product === addedOrUpdatedItem.product &&
            item.selectedPrice === addedOrUpdatedItem.selectedPrice &&
            item.selectedWeight === addedOrUpdatedItem.selectedWeight
        );

        let newCart;

        if (existingItemIndex > -1) {

          newCart = prevState.cart.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: addedOrUpdatedItem.quantity }
              : item
          );
        } else {

          newCart = [
            ...prevState.cart,
            {
              _id: addedOrUpdatedItem._id,
              product: addedOrUpdatedItem.product,
              name: addedOrUpdatedItem.name,
              image: addedOrUpdatedItem.image,
              description: addedOrUpdatedItem.description,
              selectedWeight: addedOrUpdatedItem.selectedWeight,
              selectedPrice: addedOrUpdatedItem.selectedPrice,
              quantity: addedOrUpdatedItem.quantity,
            },
          ];
        }
        return { cart: newCart };
      });

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },


  removeFromCart: async (cartItemId) => {
    try {
      await axios.delete(`/cart`, {
        data: { cartItemId },
      });
      set((state) => {
        const updatedCart = state.cart.filter((item) => item._id !== cartItemId);
        return { cart: updatedCart };
      });
      get().calculateTotals();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  },

  updateQuantity: async (cartItemId, newQuantity) => {
    try {
      if (newQuantity === 0) {
        await get().removeFromCart(cartItemId);
        return;
      }

      const response = await axios.put(`/cart/${cartItemId}`, {
        quantity: newQuantity,
      });
      // Update the quantity of the specific item in the local cart
      set((state) => {
        const updatedCart = state.cart.map((item) =>
          item._id === cartItemId ? { ...item, quantity: newQuantity } : item // Use newQuantity directly
        );
        return { cart: updatedCart };
      });

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  },
  calculateTotals: () => {
    const { cart, coupon, isCouponApplied } = get();

    // Calculate subtotal as sum of item prices * quantity (no discount here)
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.selectedPrice || 0) * item.quantity,
      0
    );

    let total = subtotal;

    // Apply discount on the total (after subtotal calculation)
    if (coupon && isCouponApplied && coupon.discountPercentage) {
      const discountAmount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discountAmount;
    }

    set({
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      discount: coupon && isCouponApplied && coupon.discountPercentage
        ? Math.round((subtotal * (coupon.discountPercentage / 100)) * 100) / 100
        : 0,
    });
  },

}));

