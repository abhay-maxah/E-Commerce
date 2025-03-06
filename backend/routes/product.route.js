import e from "express";
import {
  getAllProducts,
  toggleFeaturedProduct,
  getProductsByCategory,
  getRecommendeProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";
const router = e.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendeProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
//when you update awhole document use put but when you update a specific field use patch

export default router;
