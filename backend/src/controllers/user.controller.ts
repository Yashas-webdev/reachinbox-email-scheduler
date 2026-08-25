import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createUser = async (
    req: Request,
    res: Response
) => {
    try {
        const { googleId, name, email, avatar } = req.body;

        if (!googleId || !name || !email) {
            return res.status(400).json({
                message: "googleId, name and email are required",
            });
        }

        // Check if user already exists with same googleId or email
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this googleId or email already exists",
                // user: existingUser
            });
        }

        const user = await prisma.user.create({
            data: {
                googleId,
                name,
                email,
                avatar,
            },
        });

        return res.status(201).json({
            message: "User created successfully",
            user,
        });

    } catch (error) {
        console.error("Create user error:", error);

        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

        return res.status(500).json({
            message: "Failed to create user",
            error: errorMessage,
        });
    }
};