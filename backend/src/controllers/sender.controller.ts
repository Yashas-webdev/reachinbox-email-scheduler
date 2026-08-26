import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  createSender,
  getSenders,
} from "../services/sender.service.js";

// Controller 1: Handle POST request to create a new sender
export const createSenderController = async (
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
      name,
      email,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
    } = req.body;

    // Validate that all required SMTP fields are present
    if (
      !name ||
      !email ||
      !smtpHost ||
      !smtpPort ||
      !smtpUser ||
      !smtpPassword
    ) {
      return res.status(400).json({
        message: "All sender fields are required",
      });
    }

    const sender = await createSender(userId, {
      name,
      email,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPassword,
    });

    return res.status(201).json({
      sender,
    });
  } catch (error) {
    console.error("Create sender error:", error);

    return res.status(500).json({
      message: "Failed to create sender",
    });
  }
};

// Controller 2: Handle GET request to fetch user's senders
export const getSendersController = async (
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

    const senders = await getSenders(userId);

    return res.status(200).json({
      senders,
    });
  } catch (error) {
    console.error("Get senders error:", error);

    return res.status(500).json({
      message: "Failed to fetch senders",
    });
  }
};
