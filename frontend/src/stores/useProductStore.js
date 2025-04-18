import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },
  getAllProductsForSearch: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/search");
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response.data.error || "Failed to fetch products");
    }
  },

  fetchAllProducts: async ({
    page = 1,
    limit = 10,
    sortBy = "newest",
    category = "",
  } = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get("/products", {
        params: { page, limit, sortBy, category }, // Send query params
      });

      set({
        products: response.data.products,
        totalPages: response.data.totalPages, // Ensure backend returns totalPages
        loading: false,
      });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  // fetchProductsByCategory: async (category) => {
  //   set({ isLoading: true, products: [] }); // Clear products before fetching

  //   try {
  //     const response = await axios.get(`/products/category/${category}`);
  //     set({ products: response.data, isLoading: false });
  //   } catch (error) {
  //     const errorMessage =
  //       error.response?.data?.error || "Failed to fetch products";
  //     set({ error: errorMessage, isLoading: false });
  //     toast.error(errorMessage);
  //   }
  // },
  fetchProductsByCategory: async (
    category,
    sortBy = "newest",
    page = 1,
    limit = 3
  ) => {
    set({ isLoading: true, products: [], error: null }); // Reset state before fetching

    try {
      const response = await axios.get(`/products/category/${category}`, {
        params: { sortBy, page, limit },
      });

      set({
        products: response.data.products,
        totalProducts: response.data.totalProducts,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch products";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.filter(
          (product) => product._id !== productId
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "Failed to delete product");
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      const updatedProduct = response.data;

      set((state) => {
        const updatedProducts = state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: updatedProduct.isFeatured }
            : product
        );
        return { products: updatedProducts, loading: false };
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  },


  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
  fetchProductById: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/products/specific/${productId}`);
      set({ product: response.data, loading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch product";
      set({ error: errorMessage, loading: false });
      console.error("Error fetching product by ID:", error);
    }
  },

  updateProduct: async (productId, updatedProduct) => {
    set({ loading: true });
    try {
      const response = await axios.put(
        `/products/${productId}`,
        updatedProduct
      );
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, ...response.data.updatedData }
            : product
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  },
}));
