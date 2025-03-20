import e from "express";
import {
  getAllProducts,
  toggleFeaturedProduct,
  getProductsByCategory,
  getRecommendeProducts,
  getFeaturedProducts,
  createProduct,
  getDetailForSpecificProduct,
  getAllProductsForSearch,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";
const router = e.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/search", getAllProductsForSearch);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/specific/:id", getDetailForSpecificProduct);
router.get("/recommendations", getRecommendeProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
//when you update awhole document use put but when you update a specific field use patch

export default router;
