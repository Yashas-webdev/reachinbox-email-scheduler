import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createUser = async(
    req: Request,
    res: Response
) => {
    try{
        const {googleId, name, email, avatar}= req.body;

        if(!googleId || !name || !email){
            return res.status(400).json({
                message: "googleId, name and email are require",
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
        console.error("Create user error",error);

        return res.status(500).json({
            message: "Failed to create user",
        })

    }

};