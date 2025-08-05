import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set, get) => ({
  products: [],
  searchProducts: [],
  source: "",
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
      toast.success("Product created successfully");
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },

  getAllProductsForSearch: async (query = "") => {
    set({ loading: true, error: null });
    try {
      let endpoint = "/products/search";
      if (query && query.trim() !== "") {
        endpoint = `/products/search?q=${encodeURIComponent(query.trim())}`;
      } else {
        if (!query || query.trim() === "") {
          set({ searchProducts: [], loading: false });
          return;
        }
      }
      const response = await axios.get(endpoint);
      // Map over products to explicitly set firstImage property or flatten images
      const processedProducts = response.data.map(product => ({
        ...product,
        firstImage: product.images && product.images.length > 0 ? product.images[0] : null,
      }));

      set({ searchProducts: processedProducts, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch products";
      set({ error: errorMessage, loading: false, searchProducts: [] });
      toast.error(errorMessage);
    }
  },

  clearSearch: () => set({ searchProducts: [], error: null, loading: false }),
  fetchAllProducts: async ({
    page = 1,
    limit = 10,
    sortBy = "newest",
    category = "",
  } = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get("/products", {
        params: { page, limit, sortBy, category }, 
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
    const prevProducts = get().products;

    // Optimistically remove product from UI
    const filteredProducts = prevProducts.filter(
      (product) => product._id !== productId
    );
    set({ products: filteredProducts });

    try {
      await axios.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
    } catch (error) {
      // Rollback UI
      set({ products: prevProducts });
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  },

  toggleFeaturedProduct: async (productId) => {
    const prevProducts = get().products;

    // Optimistically toggle featured
    const toggledProducts = prevProducts.map((product) =>
      product._id === productId
        ? { ...product, isFeatured: !product.isFeatured }
        : product
    );
    set({ products: toggledProducts });

    try {
      await axios.patch(`/products/${productId}`);
      toast.success("Featured status updated");
    } catch (error) {
      // Rollback toggle
      set({ products: prevProducts });
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({
        products: response.data.data,
        source: response.data.source, 
        loading: false,
      });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
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
    // 1. Optimistically update product in local state
    const prevProducts = get().products;
    const updatedLocalProduct = {
      ...prevProducts.find(p => p._id === productId),
      ...updatedProduct,
    };

    // Update local state immediately
    set({
      products: prevProducts.map(product =>
        product._id === productId ? updatedLocalProduct : product
      )
    });

    // 2. Send request in background
    try {
      const response = await axios.put(
        `/products/${productId}`,
        updatedProduct
      );

      // Optional: Replace with backend-confirmed response (if it differs)
      if (response.data?.updatedData) {
        set((state) => ({
          products: state.products.map(product =>
            product._id === productId
              ? { ...product, ...response.data.updatedData }
              : product
          )
        }));
      }

      toast.success("Product updated successfully");
    } catch (error) {
      // 3. Rollback on failure
      set({ products: prevProducts });
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  },
}));
