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
    pricing: [
      {
        weight: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: [(val) => val.length > 0, "Provide at least one image URL"],
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
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
