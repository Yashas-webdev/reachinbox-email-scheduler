import { Router } from "express";
import { googleLogin } from "../controllers/user.controller.js";

const router = Router();

router.post("/google", googleLogin);

export default router;