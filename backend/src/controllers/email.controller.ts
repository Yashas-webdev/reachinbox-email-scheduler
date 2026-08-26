import nodemailer from "nodemailer";
import type { Request, Response } from "express";
import { sendEmail } from "../services/email.services.js"

export const testEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        message: "to, subject and body are required",
      });
    }

    const info = await sendEmail({
      to,
      subject,
      body,
    });

    return res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
  } catch (error) {
    console.error("Test email error:", error);

    return res.status(500).json({
      message: "Failed to send email",
    });
  }
};