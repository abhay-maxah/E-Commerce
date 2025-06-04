import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, PlusCircle, XCircle, Trash2 } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { toast } from "react-hot-toast";

const categories = ["Cookies", "Chocolates"];

const CreateProductForm = ({ productToEdit, closeModal = () => { } }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    pricing: [{ weight: "", price: "" }],
    price: "",
    category: "",
    images: [],
  });

  const { createProduct, updateProduct, loading } = useProductStore();

  useEffect(() => {
    if (productToEdit) {
      setProduct({
        name: productToEdit.name || "",
        description: productToEdit.description || "",
        pricing: productToEdit.pricing || [{ weight: "", price: "" }],
        price: productToEdit.price || "",
        category: productToEdit.category || "",
        images: productToEdit.images || [],
      });
    }
  }, [productToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!product.images.length) {
      toast.error("Please upload at least one image.");
      return;
    }

    if (product.category === "Chocolates" && !product.price) {
      toast.error("Please enter a price for Chocolates.");
      return;
    }

    try {
      const payload =
        product.category === "Cookies"
          ? product
          : {
            ...product,
            pricing: [{ weight: "", price: product.price }],
          };

      if (productToEdit) {
        await updateProduct(productToEdit._id, payload);
      } else {
        await createProduct(payload);
      }

      setProduct({
        name: "",
        description: "",
        pricing: [{ weight: "", price: "" }],
        price: "",
        category: "",
        images: [],
      });

      // Only call closeModal if it's a function
      if (typeof closeModal === "function") {
        closeModal();
      }
    } catch (err) {
      console.log("Error submitting the product", err);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    const readFile = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

    try {
      const imagesData = await Promise.all(files.map(readFile));
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...imagesData],
      }));
    } catch (error) {
      console.error("Error reading files", error);
    }
  };

  const handlePricingChange = (index, field, value) => {
    const updatedPricing = [...product.pricing];
    updatedPricing[index][field] = value;
    setProduct({ ...product, pricing: updatedPricing });
  };

  const addPricing = () => {
    setProduct({ ...product, pricing: [...product.pricing, { weight: "", price: "" }] });
  };

  const removePricing = (index) => {
    const updatedPricing = product.pricing.filter((_, i) => i !== index);
    setProduct({ ...product, pricing: updatedPricing });
  };

  const removeImage = (index) => {
    const updatedImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: updatedImages });
  };

  return (
    <motion.div
      className="bg-white border border-red-500/30 shadow-lg rounded-lg p-6 sm:p-8 max-w-lg mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Close Button */}
      {productToEdit && (
        <button
          onClick={() => {
            if (typeof closeModal === "function") closeModal();
          }}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
        >
          <XCircle className="h-6 w-6" />
        </button>
      )}

      <h2 className="text-2xl font-semibold mb-6 text-[#A31621] text-center">
        {productToEdit ? "Update Product" : "Create New Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">Product Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">Description</label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows="3"
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:outline-none"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">Category</label>
          <select
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:outline-none"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing - Cookies */}
        {product.category === "Cookies" && (
          <div>
            <label className="block text-sm font-medium text-[#A31621] mb-1">
              Pricing (Weight & Price)
            </label>
            {product.pricing.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Weight (e.g., 250g)"
                  value={item.weight}
                  onChange={(e) => handlePricingChange(index, "weight", e.target.value)}
                  className="flex-1 border border-red-300 rounded-md py-2 px-3 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handlePricingChange(index, "price", e.target.value)}
                  className="flex-1 border border-red-300 rounded-md py-2 px-3 focus:outline-none"
                  required
                />
                {product.pricing.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePricing(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPricing}
              className="text-sm text-[#A31621] mt-1 hover:underline"
            >
              + Add more weight/price
            </button>
          </div>
        )}

        {/* Price - Chocolates */}
        {product.category === "Chocolates" && (
          <div>
            <label className="block text-sm font-medium text-[#A31621]">Price (₹)</label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:outline-none"
              required
            />
          </div>
        )}

        {/* Images Upload */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-[#A31621] mb-1">Upload Images</label>
          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <label
            htmlFor="image"
            className="cursor-pointer py-2 px-3 border border-red-400 rounded-md text-sm font-medium hover:bg-red-500 hover:text-white transition flex items-center w-fit"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Images
          </label>

          {/* Image Preview */}
          <div className="flex flex-wrap gap-2 mt-2">
            {product.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="h-16 w-16 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-700 shadow"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium 
            bg-transparent border border-[#A31621] text-[#A31621] hover:bg-[#A31621] hover:text-white 
            focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#A31621] disabled:opacity-50 transition`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              {productToEdit ? "Update Product" : "Create Product"}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
