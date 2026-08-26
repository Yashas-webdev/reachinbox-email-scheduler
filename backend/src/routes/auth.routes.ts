import { Router } from "express";
import { googleLogin,  logout, getCurrentUser } from "../controllers/auth.controller.js";
import { authenticated } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/google", googleLogin);
router.get("/me", authenticated, getCurrentUser);
router.post("/logout", logout);

export default router;