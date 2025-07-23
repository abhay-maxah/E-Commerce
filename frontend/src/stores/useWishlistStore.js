import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],

  getWishlist: async () => {
    try {
      const response = await axios.get("/wishlist");
      set({ wishlist: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load wishlist");
    }
  },

  addToWishlist: async (product, selectedWeight, selectedPrice) => {
    // Normalize: Get the productId from either an object or string
    const productId =
      typeof product === "object" && product !== null ? product._id : product;

    if (!productId) {
      return toast.error("Invalid product data. Cannot add to wishlist.");
    }

    try {
      const response = await axios.post("/wishlist", {
        productId,
        selectedWeight,
        selectedPrice,
      });

      const newItem = response.data.savedItem;

      const newItemProductId =
        typeof newItem.product === "object" && newItem.product !== null
          ? newItem.product._id
          : newItem.product;

      set((state) => {
        const alreadyExists = state.wishlist.some((item) => {
          const itemProductId =
            typeof item.product === "object" && item.product !== null
              ? item.product._id
              : item.product;

          return (
            itemProductId === newItemProductId &&
            item.selectedWeight === newItem.selectedWeight &&
            item.selectedPrice === newItem.selectedPrice
          );
        });

        if (alreadyExists) return state;

        return { wishlist: [...state.wishlist, newItem] };
      });

      toast.success("Item saved for Wishlist");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save item");
    }
  },
  removeFromWishlist: async (productId) => {
    try {
      await axios.delete(`/wishlist/${productId}`);

      set((state) => ({
        wishlist: state.wishlist.filter(
          (item) =>
            (item.product?._id || item.product) !== productId
        ),
      }));

      toast.success("Item removed from wishlist");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  },


  clearWishlist: () => {
    set({ wishlist: [] });
  },
}));
