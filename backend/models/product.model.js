import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: [true, "image is required"],
    },
    category: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ name: 1 }); // Index on name for fast search
productSchema.index({ category: 1 }); // Index on category for filtering by category
productSchema.index({ isFeatured: 1 }); // Index on isFeatured for filtering by featured status

const Product = mongoose.model("Product", productSchema);
export default Product;
