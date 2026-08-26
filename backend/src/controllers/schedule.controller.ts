import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  createSchedule,
  getSchedules,
  getSentEmails,
} from "../services/schedule.service.js";

// Controller 1: Handle POST request to create a new email campaign schedule
export const createScheduleController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      senderId,
      subject,
      body,
      startTime,
      delayBetweenEmails,
      hourlyLimit,
      recipients,
    } = req.body;

    // Validation checks
    if (!senderId || !subject || !body || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        message: "senderId, subject, body, and recipients array are required",
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        message: "Recipients list cannot be empty",
      });
    }

    const schedule = await createSchedule(userId, {
      senderId,
      subject,
      body,
      startTime: startTime || new Date().toISOString(),
      delayBetweenEmails: Number(delayBetweenEmails) || 0,
      hourlyLimit: Number(hourlyLimit) || 0,
      recipients,
    });

    return res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);

    const errorMsg = error instanceof Error ? error.message : "Failed to create schedule";

    return res.status(500).json({
      message: errorMsg,
    });
  }
};

// Controller 2: Handle GET request to fetch user's schedules
export const getSchedulesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const schedules = await getSchedules(userId);

    return res.status(200).json({
      schedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);

    return res.status(500).json({
      message: "Failed to fetch schedules",
    });
  }
};

// Controller 3: Handle GET request to fetch sent/failed email logs
export const getSentEmailsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const emails = await getSentEmails(userId);

    return res.status(200).json({
      emails,
    });
  } catch (error) {
    console.error("Get sent emails error:", error);

    return res.status(500).json({
      message: "Failed to fetch sent emails",
    });
  }
};
