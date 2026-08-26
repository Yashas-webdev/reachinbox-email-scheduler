import { Router } from "express";
import {
  createSenderController,
  getSendersController,
} from "../controllers/sender.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint: POST /api/senders (Protected by authenticate middleware)
router.post("/", authenticate, createSenderController);

// Endpoint: GET /api/senders (Protected by authenticate middleware)
router.get("/", authenticate, getSendersController);

export default router;
