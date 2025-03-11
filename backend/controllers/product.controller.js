import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const getFeaturedProducts = async (req, res) => {
  try {
    let featureProduct = await redis.get("feature_products");
    if (featureProduct) {
      return res.json(JSON.parse(featureProduct));
    }
    featureProduct = await Product.find({ isFeatured: true }).lean(); //lean is used for return a JS object insert og MongoDB Object
    if (!featureProduct) {
      return res.status(404).json({ message: "No featured products found" });
    }
    await redis.set("feature_products", JSON.stringify(featureProduct));
    res.status(200).json(featureProduct);
  } catch (error) {
    console.log("Error in getFeaturedProducts", error.message);
    res.status(500).json(error);
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
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      const imageBuffer = Buffer.from(image.split(",")[1], "base64");
      console.log("Original Image Size:", imageBuffer.length / 1024, "KB");

      // Compress the image in memory
      const compressedBuffer = await sharp(imageBuffer)
        .resize({ width: 800 }) // Resize to a max width of 800px
        .jpeg({ quality: 80 }) // Compress with 80% quality
        .toBuffer();

      console.log(
        "Compressed Image Size:",
        compressedBuffer.length / 1024,
        "KB"
      );

      // Convert the compressed buffer to base64
      const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString(
        "base64"
      )}`;

      // Upload to Cloudinary directly from buffer
      cloudinaryResponse = await cloudinary.uploader.upload(compressedBase64, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url || "",
      category,
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
    const product = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          name: 1,
          price: 1,
          image: 1,
          _id: 1,
          description: 1,
        },
      },
    ]);
    res.status(200).json(product);
  } catch (error) {
    console.log("Error in getReccommendeProduct", error.message);
    res.status(500).json(error);
  }
};
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in category", error.message);
    res.status(500).json(error);
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
      console.log("Upadte a product");
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
