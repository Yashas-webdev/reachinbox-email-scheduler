import { Router } from "express";
import {
  createScheduleController,
  getSchedulesController,
  getSentEmailsController,
} from "../controllers/schedule.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint: POST /api/schedules (Create schedule)
router.post("/", authenticate, createScheduleController);

// Endpoint: GET /api/schedules (List schedules)
router.get("/", authenticate, getSchedulesController);

// Endpoint: GET /api/schedules/sent (List sent/failed email logs)
router.get("/sent", authenticate, getSentEmailsController);

export default router;
