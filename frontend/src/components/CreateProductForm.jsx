import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, PlusCircle, XCircle } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const categories = ["Cookies", "Chocolates"];

const CreateProductForm = ({ productToEdit, closeModal }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const { createProduct, updateProduct, loading } = useProductStore();

  useEffect(() => {
    if (productToEdit) {
      setProduct({
        name: productToEdit.name || "",
        description: productToEdit.description || "",
        price: productToEdit.price || "",
        category: productToEdit.category || "",
        image: productToEdit.image || "",
      });
    }
  }, [productToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (productToEdit) {
        await updateProduct(productToEdit._id, product);
      } else {
        await createProduct(product);
      }

      // Clear form fields after successful submission
      setProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });

      closeModal();
    } catch {
      console.log("Error submitting the product");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct({ ...product, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="bg-white border border-red-500/30 shadow-lg rounded-lg p-6 sm:p-8 max-w-lg mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Close Modal Button */}
      {productToEdit && (
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
        >
          <XCircle className="h-6 w-6" />
        </button>
      )}
      <h2 className="text-2xl font-semibold mb-6 text-[#A31621] text-center">
        {productToEdit ? "Update Product" : "Create New Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">
            Product Name
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:ring-red-400 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">
            Description
          </label>
          <textarea
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:ring-red-400 focus:outline-none"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">
            Price
          </label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:ring-red-400 focus:outline-none"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#A31621]">
            Category
          </label>
          <select
            value={product.category}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
            className="mt-1 block w-full border border-red-300 rounded-md py-2 px-3 focus:ring-red-400"
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

        {/* Image Upload */}
        <div className="mt-1 flex items-center gap-4">
          <input
            type="file"
            id="image"
            className="sr-only"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label
            htmlFor="image"
            className="cursor-pointer py-2 px-3 border border-red-400 rounded-md text-sm font-medium hover:bg-red-500 hover:text-white transition flex items-center"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Image
          </label>
          {product.image && (
            <img
              src={product.image}
              alt="Product"
              className="h-12 w-12 object-cover rounded-md border"
            />
          )}
        </div>

        {/* Submit Button  */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium 
            bg-transparent border border-[#A31621] text-[#A31621] hover:bg-[#A31621] hover:text-white 
            focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#A31621] disabled:opacity-50 transition`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
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
