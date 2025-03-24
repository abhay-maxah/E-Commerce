import express from "express";
const router = express.Router();
import { protectRoute } from "../Middleware/auth.middleware.js";
import {
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
} from "../controllers/address.controller.js";

router.post("/", protectRoute, addAddress);
router.get("/", protectRoute, getAddress);
router.put("/:addressId", protectRoute, updateAddress);
router.delete("/:addressId", protectRoute, deleteAddress);
export default router;