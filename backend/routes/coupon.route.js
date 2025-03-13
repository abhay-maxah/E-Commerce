import express from "express";

import {
  getCoupon,
  validateCoupon,
  removeCoupon,
} from "../controllers/coupon.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);
router.delete("/", protectRoute, removeCoupon);
export default router;
