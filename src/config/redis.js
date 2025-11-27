import { createClient } from "redis";

export const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.log("Redis error", err));

await redis.connect();
