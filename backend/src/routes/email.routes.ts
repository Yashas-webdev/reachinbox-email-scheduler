import { Router } from "express";
import { testEmail } from "../controllers/email.controller.js";

const router = Router();

router.post("/test", testEmail);

export default router;