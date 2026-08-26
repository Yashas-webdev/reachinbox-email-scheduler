import { prisma } from "../config/prisma.js";

interface CreateSenderInput {
  name: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
}

// Function 1: Save a new sender in PostgreSQL database
export const createSender = async (
  userId: string,
  data: CreateSenderInput
) => {
  return prisma.sender.create({
    data: {
      name: data.name,
      email: data.email,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUser: data.smtpUser,
      smtpPassword: data.smtpPassword,
      userId,
    },
  });
};

// Function 2: Fetch all senders belonging to the logged-in user
export const getSenders = async (userId: string) => {
  return prisma.sender.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
