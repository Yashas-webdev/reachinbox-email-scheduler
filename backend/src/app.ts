import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./config/prisma.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import emailRoutes from "./routes/email.routes.js";
import senderRoutes from "./routes/sender.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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


//Temporary development user route
app.use("/api/users", userRoutes);

//Authentication routes
app.use("/api/auth", authRoutes);

//email routes
app.use("/api/emails", emailRoutes);

//Sender routes
app.use("/api/senders", senderRoutes);

//Schedule routes
import scheduleRoutes from "./routes/schedule.routes.js";
app.use("/api/schedules", scheduleRoutes);

export default app;