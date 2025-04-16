import express from "express";
import {
  checkoutSuccess,
  createCheckoutSession,
  createYearlyPremiumSession,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

// route for Premium Plan
router.post("/create-yearly-premium-session", protectRoute, createYearlyPremiumSession);

export default router;
