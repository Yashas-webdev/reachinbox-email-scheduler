import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Basic server health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

// Database health check
app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

export default app;