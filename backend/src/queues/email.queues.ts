import { Queue } from "bullmq";
import redis from "../config/redis.js";

// BullMQ Queue instance for email scheduling
export const emailQueue = new Queue("email-scheduler", {
  connection: redis,
});
