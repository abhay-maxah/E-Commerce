import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import sharp from "sharp";
import mongoose from "mongoose";

export const getAllProductsForSearch = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    let products;

    const queryFields = {
      _id: 1,
      name: 1,
      images: 1, // fetch the full array, pick first later
    };

    if (searchQuery && searchQuery.trim() !== "") {
      const rawProducts = await Product.find(
        {
          $or: [
            { name: { $regex: searchQuery.trim(), $options: "i" } },
          ],
        },
        queryFields
      ).limit(10);

      // Transform result to include only the first image
      products = rawProducts.map((product) => ({
        _id: product._id,
        name: product.name,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
      }));
    } else {
      products = [];
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy = "newest", category = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let sortOptions = {};
    // Removed price-based sorting options
    if (sortBy === "oldest") {
      sortOptions.createdAt = 1;
    } else {
      sortOptions.createdAt = -1; // Default to newest
    }

    let filterOptions = {};
    if (category && category !== "all") {
      filterOptions.category = category;
    }

    const products = await Product.find(filterOptions)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filterOptions);

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error, unable to fetch products" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featureProduct = await redis.get("feature_products");
    if (featureProduct) {
      return res.status(200).json({
        source: "redis",
        data: JSON.parse(featureProduct)
      });
    }

    featureProduct = await Product.find({ isFeatured: true }).lean();
    if (featureProduct.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("feature_products", JSON.stringify(featureProduct), 'EX', 60 * 60 * 24 * 15); // 15 days TTL
    res.status(200).json({
      source: "mongodb",
      data: featureProduct
    });
  } catch (error) {
    console.log("Error in getFeaturedProducts", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// export const createProduct = async (req, res) => {
//   try {
//     const { name, description, price, image, category } = req.body;

//     let cloudinaryResponse = null;

//     if (image) {
//       cloudinaryResponse = await cloudinary.uploader.upload(image, {
//         folder: "products",
//       });
//     }

//     const product = await Product.create({
//       name,
//       description,
//       price,
//       image: cloudinaryResponse?.secure_url
//         ? cloudinaryResponse.secure_url
//         : "",
//       category,
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     console.log("Error in createProduct controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, images, category } = req.body;

    if (!images || !images.length) {
      return res.status(400).json({ error: "Provide at least one image URL" });
    }

    const uploadedImageUrls = [];

    for (const image of images) {
      const imageBuffer = Buffer.from(image.split(",")[1], "base64");

      const compressedBuffer = await sharp(imageBuffer)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toBuffer();

      const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;

      const cloudinaryResponse = await cloudinary.uploader.upload(compressedBase64, {
        folder: "products",
      });

      uploadedImageUrls.push(cloudinaryResponse.secure_url);
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: uploadedImageUrls, // Save array of URLs
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("deleted image from cloduinary");
      } catch (error) {
        console.log("error deleting image from cloduinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getRecommendeProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      }
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getRecommendeProducts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sortBy, page = 1, limit = 3 } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Case-insensitive category filter
    let filter = { category: { $regex: new RegExp(category, "i") } };

    let sortOptions = {};
    if (sortBy === "newest") sortOptions.createdAt = -1;
    else if (sortBy === "oldest") sortOptions.createdAt = 1;
    else if (sortBy === "price_high_low") sortOptions.price = -1;
    else if (sortBy === "price_low_high") sortOptions.price = 1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Get total product count
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
    });
  } catch (error) {
    console.error("❌ Error Fetching Products:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      //update in redis
      await updateFeaturedProductsCache();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct", error.message);
    res.status(500).json(error);
  }
};
async function updateFeaturedProductsCache() {
  try {
    const featureProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("feature_products", JSON.stringify(featureProducts));
  } catch (error) {
    console.log("Error in reid update for toggle", error.message);
    res.status(500).json(error);
  }
}
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, images = [], pricing = [] } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle new image uploads if any
    const updatedImageUrls = [];
    for (const img of images) {
      if (img.startsWith("http")) {
        // Already uploaded
        updatedImageUrls.push(img);
      } else if (img.includes("base64")) {
        try {
          const imageBuffer = Buffer.from(img.split(",")[1], "base64");
          const compressedBuffer = await sharp(imageBuffer)
            .resize({ width: 800 })
            .jpeg({ quality: 80 })
            .toBuffer();

          const cloudinaryRes = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`,
            { folder: "products" }
          );
          updatedImageUrls.push(cloudinaryRes.secure_url);
        } catch (err) {
          console.error("Image upload failed:", err.message);
          return res.status(400).json({ message: "Image processing failed" });
        }
      }
    }

    // Validate pricing array
    const validPricing = pricing
      .filter((item) => item.weight && item.price >= 0)
      .map((item) => ({
        weight: item.weight,
        price: item.price,
      }));

    // Prepare update object
    const updatedFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(updatedImageUrls.length && { images: updatedImageUrls }),
      ...(validPricing.length && { pricing: validPricing }),
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      updatedData: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDetailForSpecificProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid or missing product ID" });
    }
    const product = await Product.findById(id).populate("category").lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(
      "Error in getDetailForSpecificProduct controller",
      error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
