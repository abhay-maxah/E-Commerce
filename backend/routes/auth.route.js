import e from "express";
import { login, logout, signup,refreshToken,getProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";

const router = e.Router();

router.post("/signup", signup);
router.post("/login",login)
router.post("/logout",logout)
router.post("/referesh-token",refreshToken)
router.get('/profile',protectRoute,getProfile)
export default router;
