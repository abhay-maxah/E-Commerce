import e from "express";
import { login, logout, signup, refreshToken, getProfile, getAllUsers, deleteUserById, loginGoogle, sendAuthCode, sendAuthCodeForgot, verifyAuthCode, resetPassword } from "../controllers/auth.controller.js";
import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";

const router = e.Router();

router.post("/signup", signup);
router.post("/login", login)
router.post("/logout", logout)
router.post("/send-code", sendAuthCode)
router.post("/send-code-forgot", sendAuthCodeForgot)
router.post("/verify-code", verifyAuthCode)
router.post("/reset-password", resetPassword)
router.get("/login/google", loginGoogle)
router.post("/referesh-token", refreshToken)
router.get('/profile', protectRoute, getProfile)
router.get('/', protectRoute, adminRoute, getAllUsers)
router.delete('/:userId', protectRoute, deleteUserById)

export default router;
