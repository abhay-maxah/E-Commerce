import express from "express";
const router = express.Router();
import { protectRoute } from "../Middleware/auth.middleware.js";
import {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
  togleVisiblity,
} from "../controllers/address.controller.js";

router.post("/", protectRoute, addAddress);
router.get("/", protectRoute, getAddress);
router.patch("/visible/:addressId", protectRoute, togleVisiblity);
router.put("/:addressId", protectRoute, updateAddress);
router.delete("/:addressId", protectRoute, deleteAddress);
export default router;
