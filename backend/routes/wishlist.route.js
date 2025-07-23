import express from "express";
import {
  addToSaveForLater,
  removeFromSaveForLater,
  getSavedForLaterItems,
} from "../controllers/wishlist.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";

const router = express.Router();

// Protected routes — use auth middleware if needed
router.post("/", protectRoute,addToSaveForLater);
router.delete("/:productId",protectRoute,removeFromSaveForLater);
router.get("/",protectRoute, getSavedForLaterItems);

export default router;
