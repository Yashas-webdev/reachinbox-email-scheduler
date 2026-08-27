import { Redis } from "ioredis";

// Redis client configuration for BullMQ and Rate Limiting
const redisOptions = {
  maxRetriesPerRequest: null,
};

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      ...redisOptions,
    });

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export default redis;
