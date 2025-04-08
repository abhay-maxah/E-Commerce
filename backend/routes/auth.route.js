import e from "express";
import { login, logout, signup, refreshToken, getProfile, getAllUsers, deleteUserById, loginGoogle, sendAuthCode, verifyAuthCode } from "../controllers/auth.controller.js";
import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";

const router = e.Router();

router.post("/signup", signup);
router.post("/login", login)
router.post("/logout", logout)
router.post("/send-code", sendAuthCode)
router.post("/verify-code", verifyAuthCode)
router.get("/login/google", loginGoogle)
router.post("/referesh-token", refreshToken)
router.get('/profile', protectRoute, getProfile)
router.get('/', protectRoute, adminRoute, getAllUsers)
router.delete('/:userId', protectRoute, adminRoute, deleteUserById)

export default router;
