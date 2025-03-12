import express from "express";
import {
  addToCart,
  updateQuantity,
  getCartProducts,
  removeAllFromCart,
  cleanCartAfterPurchese,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";
const router = express.Router();

router.post("/", protectRoute, addToCart);
router.get("/", protectRoute, getCartProducts);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);
router.delete("/clean", protectRoute, cleanCartAfterPurchese);

export default router;
