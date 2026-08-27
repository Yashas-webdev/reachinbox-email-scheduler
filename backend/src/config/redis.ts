import { Redis } from "ioredis";

// Redis client configuration for BullMQ and Rate Limiting
const redisOptions = {
  maxRetriesPerRequest: null,
};

// Clean REDIS_URL from any accidental quotes or trailing whitespace
const rawRedisUrl = process.env.REDIS_URL ? process.env.REDIS_URL.trim().replace(/^["']|["']$/g, "") : null;

const redis = rawRedisUrl
  ? new Redis(rawRedisUrl, redisOptions)
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
