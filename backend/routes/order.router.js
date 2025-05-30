import express from "express";
import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";
import {
    getAllOrder,
    generateInvoice,
    updateOrderStatus,
    getAllOrderForAdmin,
    emailInvoice
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/all-order", protectRoute, adminRoute, getAllOrderForAdmin)
router.get("/:userId", protectRoute, getAllOrder);
router.get("/invoice/email/:orderId", emailInvoice);
router.get("/:orderId/invoice", protectRoute, generateInvoice);
router.put("/:orderId/status", protectRoute, updateOrderStatus);

export default router;
