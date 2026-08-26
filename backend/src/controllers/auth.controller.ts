import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { verifyGoogleUser } from "../services/auth.services.js";
import { generateToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "Google ID token is required",
      });
    }

    // Verify the Google user and find/create the user in PostgreSQL
    const user = await verifyGoogleUser(idToken);

    // Create application JWT
    const token = generateToken(user.id);

    // Store JWT in an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return res.status(401).json({
      message: "Google authentication failed",
      error: errorMessage,
    });
  }
};

export const getCurrentUser = async (
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        googleId: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
};

export const logout = async (
  _req: Request,
  res: Response
) => {
  res.clearCookie("token",{
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};